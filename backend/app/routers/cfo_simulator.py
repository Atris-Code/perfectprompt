"""
FastAPI REST API Router: CFO Project Finance Decision & Simulation Module.

Exposes institutional-grade Project Finance endpoints under Spec-Driven Design (SDD):
- GET  /api/cfo/processes: Supported industrial typologies, schema specifications, and defaults.
- POST /api/cfo/simulate: Multi-year cash flow waterfall, debt amortization, and sensitivities.
- POST /api/cfo/optimize-pe: Parametric electrical capacity scanner and -812 kW trap diagnosis.
- POST /api/cfo/export-memo: Comprehensive Executive Investment Committee Memorandum in Markdown.
"""

import io
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import Field

from dependencies import get_current_user
from models import User

from app.cfo.adapters import get_adapter
from app.cfo.core_engine import optimize_chp_pe, simulate_project_finance
from app.cfo.excel_export import build_excel_report
from app.cfo.memo_generator import export_memo, generate_investment_memo
from app.cfo.pydantic_compat import CfoBaseModel, dump_model
from app.cfo.specs import (
    BiocharProcessParams,
    ChpOptimizationResult,
    ChpProcessParams,
    FinancialParametersSpec,
    IndustrialProcessSpec,
    IndustrialProcessType,
    SimulationResult,
    WteRsuProcessParams,
)

from metrics import CFO_MEMO_EXPORTS, CFO_OPTIMIZE, CFO_SIMULATIONS

router = APIRouter()


# ============================================================================
# Request / Response Schemas
# ============================================================================

class ProcessCatalogItem(CfoBaseModel):
    """Catalog entry describing a supported industrial process typology."""
    id: str
    name: str
    description: str
    default_params: Dict[str, Any]


class ProcessCatalogResponse(CfoBaseModel):
    """Response payload for GET /api/cfo/processes."""
    processes: List[ProcessCatalogItem]


class PeOptimizationRequest(CfoBaseModel):
    """Request schema for POST /api/cfo/optimize-pe."""
    pe_range_min_kw: float = Field(200.0, ge=50.0, le=5000.0, description="Minimum capacity to evaluate (kWe)")
    pe_range_max_kw: float = Field(1000.0, ge=100.0, le=10000.0, description="Maximum capacity to evaluate (kWe)")
    pe_step_kw: float = Field(50.0, ge=5.0, le=500.0, description="Scanning step increment (kW)")
    baseline_params: Optional[Dict[str, Any]] = Field(None, description="Baseline CHP thermodynamic parameters")
    financial_params: Optional[Dict[str, Any]] = Field(None, description="Project Finance underwriting parameters")


class MemoExportResponse(CfoBaseModel):
    """Response payload for POST /api/cfo/export-memo."""
    filename: str
    markdown_content: str


# ============================================================================
# Payload Parsing Helpers
# ============================================================================

def _parse_simulation_payload(payload: Dict[str, Any]) -> tuple[IndustrialProcessSpec, FinancialParametersSpec]:
    """
    Robust parser handling both flat benchmark dictionaries and structured nested specs:
    1. {"process_spec": {...}, "financial_spec": {...}}
    2. {"process_type": "biochar", ..., "financial_params": {...}}
    3. {"process_type": "custom", "fixed_capex": ..., "financial_params": {...}}
    """
    # 1. Resolve Process Spec dictionary
    if "process_spec" in payload and isinstance(payload["process_spec"], dict):
        p_dict = dict(payload["process_spec"])
    else:
        p_dict = dict(payload)
        for k in ("financial_params", "financial_spec"):
            p_dict.pop(k, None)

    # Resolve Process Type
    raw_type = p_dict.get("process_type", IndustrialProcessType.BIOCHAR.value)
    if isinstance(raw_type, str):
        try:
            proc_type = IndustrialProcessType(raw_type.lower())
        except ValueError:
            proc_type = IndustrialProcessType.CUSTOM
    else:
        proc_type = raw_type

    p_dict["process_type"] = proc_type

    # Unpack process_params if provided as a generic dictionary
    if "process_params" in p_dict and isinstance(p_dict["process_params"], dict):
        nested_params = p_dict.pop("process_params")
        if proc_type == IndustrialProcessType.BIOCHAR:
            p_dict["biochar_params"] = nested_params
        elif proc_type == IndustrialProcessType.CHP:
            p_dict["chp_params"] = nested_params
        elif proc_type == IndustrialProcessType.WTE_RSU:
            p_dict["wte_rsu_params"] = nested_params

    # Convert nested parameter dicts into strongly typed models
    if proc_type == IndustrialProcessType.BIOCHAR:
        if "biochar_params" in p_dict and isinstance(p_dict["biochar_params"], dict):
            p_dict["biochar_params"] = BiocharProcessParams(**p_dict["biochar_params"])
        elif "biochar_params" not in p_dict:
            p_dict["biochar_params"] = BiocharProcessParams()
    elif proc_type == IndustrialProcessType.CHP:
        if "chp_params" in p_dict and isinstance(p_dict["chp_params"], dict):
            p_dict["chp_params"] = ChpProcessParams(**p_dict["chp_params"])
        elif "chp_params" not in p_dict:
            p_dict["chp_params"] = ChpProcessParams()
    elif proc_type == IndustrialProcessType.WTE_RSU:
        if "wte_rsu_params" in p_dict and isinstance(p_dict["wte_rsu_params"], dict):
            p_dict["wte_rsu_params"] = WteRsuProcessParams(**p_dict["wte_rsu_params"])
        elif "wte_rsu_params" not in p_dict:
            p_dict["wte_rsu_params"] = WteRsuProcessParams()

    # Provide safe fallback fixed_capex if omitted
    if "fixed_capex" not in p_dict or p_dict["fixed_capex"] is None:
        if proc_type == IndustrialProcessType.BIOCHAR:
            p_dict["fixed_capex"] = 3_200_000.0
        elif proc_type == IndustrialProcessType.CHP:
            p_dict["fixed_capex"] = 2_250_000.0
        elif proc_type == IndustrialProcessType.WTE_RSU:
            wp = p_dict.get("wte_rsu_params")
            p_dict["fixed_capex"] = wp.capex_per_ton_year * wp.annual_capacity_t * (1.0 - wp.grant_fraction)
        else:
            p_dict["fixed_capex"] = 1_000_000.0

    if "name" not in p_dict or not p_dict["name"]:
        p_dict["name"] = f"Planta {proc_type.value.capitalize()} Industrial"

    process_spec = IndustrialProcessSpec(**p_dict)

    # 2. Resolve Financial Spec dictionary
    f_dict = payload.get("financial_spec") or payload.get("financial_params") or {}
    financial_spec = FinancialParametersSpec(**f_dict) if f_dict else FinancialParametersSpec()

    return process_spec, financial_spec


# ============================================================================
# API Endpoints
# ============================================================================

@router.get(
    "/processes",
    response_model=ProcessCatalogResponse,
    summary="List Supported Industrial Typologies",
    description="Returns the catalog of supported industrial process models, physical schemas, and default parameters.",
)
def get_processes(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Catalog of industrial typologies supported by the SDD engine."""
    biochar_defaults = BiocharProcessParams().to_dict()
    biochar_defaults.update({
        "fixed_capex": 3_200_000.0,
        "nwc": 150_000.0,
        "fixed_om_eur_year": 120_000.0,
        "variable_om_pct_revenue": 0.02,
    })

    chp_defaults = ChpProcessParams().to_dict()
    chp_defaults.update({
        "fixed_capex": 2_250_000.0,
        "nwc": 75_000.0,
        "fixed_om_eur_year": 45_000.0,
        "variable_om_pct_revenue": 0.02,
    })

    custom_defaults = {
        "fixed_capex": 1_000_000.0,
        "nwc": 50_000.0,
        "fixed_om_eur_year": 30_000.0,
        "variable_om_pct_revenue": 0.02,
    }

    wte_defaults = WteRsuProcessParams().to_dict()
    wte_defaults.update({
        "fixed_capex": 3_000_000.0,
        "nwc": 150_000.0,
        "fixed_om_eur_year": 250_000.0,
        "variable_om_pct_revenue": 0.02,
    })

    return {
        "processes": [
            {
                "id": "biochar",
                "name": "Pirólisis de Biomasa & Biochar / CORCs",
                "description": "Proceso termoquímico de pirólisis para producción de biochar y monetización de créditos de carbono CORC.",
                "default_params": biochar_defaults,
            },
            {
                "id": "chp",
                "name": "Cogeneración Industrial CHP (Combined Heat & Power)",
                "description": "Planta de cogeneración de alta eficiencia con turbina/motor de gas y recuperación de calor industrial.",
                "default_params": chp_defaults,
            },
            {
                "id": "wte_rsu",
                "name": "Waste-to-Energy RSU (ISCC EU)",
                "description": "Valorización energética de residuos sólidos urbanos con certificación ISCC: gate fee, electricidad, calor, GOs y créditos de CO₂.",
                "default_params": wte_defaults,
            },
            {
                "id": "custom",
                "name": "Proceso Industrial Personalizado",
                "description": "Configuración genérica de proceso industrial para modelado Project Finance agnóstico.",
                "default_params": custom_defaults,
            },
        ]
    }


@router.post(
    "/simulate",
    summary="Execute Project Finance Simulation",
    description="Runs multi-year cash flow waterfall, French debt amortization, bankability covenants, and sensitivities.",
)
def simulate(payload: Dict[str, Any] = Body(...), current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Executes full Project Finance waterfall simulation.
    Accepts flat, nested, or spec-based payloads.
    Returns complete SimulationResult enriched for both nested and flat frontend consumers.
    """
    try:
        process_spec, financial_spec = _parse_simulation_payload(payload)
        CFO_SIMULATIONS.labels(scenario=process_spec.process_type.value).inc()
        result: SimulationResult = simulate_project_finance(process_spec, financial_spec)

        data = dump_model(result)

        # Ensure flat/convenience properties in summary for frontend compatibility
        if "summary" in data and isinstance(data["summary"], dict):
            s = data["summary"]
            s["annual_cuota"] = s.get("senior_debt_annual_payment", 0.0)
            s["ebitda_avg"] = s.get("ebitda_base_year1", 0.0)
            s["dscr_min"] = s.get("min_dscr", 0.0)
            s["dscr_avg"] = s.get("avg_dscr", 0.0)

        # Expose 'schedule' alias for annual_projections
        data["schedule"] = data.get("annual_projections", [])

        return data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Simulation error: {str(e)}",
        ) from e


@router.post(
    "/optimize-pe",
    summary="Optimize CHP Electrical Capacity & Diagnose Oversizing Trap",
    description="Scans electrical capacity range, locates optimal bankable zone (350-500 kW), and flags -812 kW trap.",
)
def optimize_pe(payload: Dict[str, Any] = Body(...), current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Parametric electrical capacity scanner for CHP systems.
    Identifies the optimal plateau and forensically detects the -812 kW oversizing trap.
    """
    try:
        CFO_OPTIMIZE.inc()
        pe_min = float(payload.get("pe_range_min_kw", payload.get("pe_min", 200.0)))
        pe_max = float(payload.get("pe_range_max_kw", payload.get("pe_max", 1000.0)))
        pe_step = float(payload.get("pe_step_kw", payload.get("pe_step", 50.0)))

        baseline_dict = payload.get("baseline_params") or payload.get("chp_params") or {}
        fin_dict = payload.get("financial_params") or payload.get("financial_spec") or {}

        baseline_params = ChpProcessParams(**baseline_dict) if baseline_dict else ChpProcessParams()
        financial_spec = FinancialParametersSpec(**fin_dict) if fin_dict else FinancialParametersSpec()

        result: ChpOptimizationResult = optimize_chp_pe(
            pe_min=pe_min,
            pe_max=pe_max,
            pe_step=pe_step,
            baseline_params=baseline_params,
            financial_spec=financial_spec,
        )

        return dump_model(result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CHP optimization error: {str(e)}",
        ) from e


@router.post(
    "/export-memo",
    response_model=MemoExportResponse,
    summary="Export Executive Investment Committee Memo",
    description="Generates a comprehensive Project Finance Investment Committee Memorandum formatted in Markdown.",
)
def export_memo_endpoint(payload: Dict[str, Any] = Body(...), current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    """
    Generates Markdown Executive Memorandum from simulation payload or specifications.
    Returns {"filename": str, "markdown_content": str}.
    """
    try:
        process_spec, financial_spec = _parse_simulation_payload(payload)
        CFO_MEMO_EXPORTS.inc()
        memo_dict = export_memo(process_spec, financial_spec)
        return memo_dict

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Memorandum export error: {str(e)}",
        ) from e


@router.post(
    "/export-excel",
    summary="Export Project Finance Model to Excel",
    description="Runs the simulation and returns a multi-sheet .xlsx report with inputs, revenue stack, cash flow waterfall, sensitivities and KPIs.",
)
def export_excel(payload: Dict[str, Any] = Body(...), current_user: User = Depends(get_current_user)):
    """Generate a downloadable .xlsx report from the simulation engine."""
    try:
        process_spec, financial_spec = _parse_simulation_payload(payload)
        result = simulate_project_finance(process_spec, financial_spec)
        adapter = get_adapter(process_spec.process_type)
        _, _, revenue_details = adapter.compute_revenue_opex(process_spec, scenario_shock=None)
        xlsx_bytes = build_excel_report(process_spec, financial_spec, result, revenue_details)
        filename = f"modelo_financiero_{process_spec.process_type.value}.xlsx"
        return StreamingResponse(
            io.BytesIO(xlsx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Excel export error: {str(e)}",
        ) from e
