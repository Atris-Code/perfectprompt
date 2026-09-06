"""
Declarative SDD (Simulation/Spec-Driven Design) Specification Models.

Defines typed, validated domain models for:
- Industrial process types and physical parameters (Biochar/Pyrolysis, CHP Cogeneration).
- Capital structuring and Project Finance financial parameters.
- Annual projection schedules, bankability metrics, covenants, and sensitivities.
- CHP electrical capacity optimization results.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from app.cfo.pydantic_compat import CfoBaseModel, Field


class IndustrialProcessType(str, Enum):
    """Supported industrial process typologies in Nexo Sinérgico."""
    BIOCHAR = "biochar"
    CHP = "chp"
    CUSTOM = "custom"


class BiocharProcessParams(CfoBaseModel):
    """Physical and operational parameters for biomass slow pyrolysis and CORCs."""
    feedstock_input_t_day: float = Field(25.0, ge=1.0, le=500.0, description="Daily feedstock throughput (t/day)")
    operating_days_year: int = Field(330, ge=100, le=365, description="Operating days per year")
    feedstock_moisture_pct: float = Field(10.0, ge=0.0, le=60.0, description="Feedstock moisture percentage (%)")
    feedstock_cost_eur_ton: float = Field(65.0, ge=0.0, le=300.0, description="Biomass feedstock cost (€/t)")
    pyrolysis_temp_c: float = Field(350.0, ge=300.0, le=800.0, description="Reactor operating temperature (°C)")
    oxygen_leak_pct: float = Field(0.0, ge=0.0, le=15.0, description="Oxygen leakage / seal ingress (%)")
    char_sale_price_eur_ton: float = Field(700.0, ge=100.0, le=2500.0, description="Market price of biochar (€/t)")
    corc_yield_tco2e_per_ton_char: float = Field(2.6, ge=1.0, le=4.0, description="CORC carbon credits per ton biochar")
    corc_price_eur_tco2e: float = Field(120.0, ge=10.0, le=500.0, description="Market price of CORC (€/t CO2e)")
    aux_electricity_kwh_ton: float = Field(45.0, ge=0.0, le=200.0, description="Auxiliary electricity use (kWh/t feedstock)")
    grid_electricity_eur_mwh: float = Field(110.0, ge=0.0, le=400.0, description="Imported electricity price (€/MWh)")
    fixed_om_eur_year: Optional[float] = Field(None, ge=0.0, description="Override fixed annual O&M (€/year)")
    variable_om_pct_revenue: Optional[float] = Field(None, ge=0.0, le=0.30, description="Variable O&M as % of gross revenue")


class ChpProcessParams(CfoBaseModel):
    """Physical and operational parameters for Combined Heat and Power cogeneration."""
    electrical_capacity_kw: float = Field(500.0, ge=50.0, le=5000.0, description="Installed electric power Pe (kWe)")
    operating_hours_year: int = Field(8000, ge=1000, le=8760, description="Equivalent operating hours per year")
    electrical_efficiency: float = Field(0.38, ge=0.25, le=0.50, description="Electrical efficiency (LHV)")
    thermal_efficiency: float = Field(0.47, ge=0.30, le=0.65, description="Thermal efficiency (LHV)")
    fuel_cost_eur_mwh_lhv: float = Field(22.625, ge=5.0, le=200.0, description="Fuel cost (€/MWh LHV)")
    electricity_sale_price_eur_mwh: float = Field(125.0, ge=20.0, le=400.0, description="Electricity tariff / revenue (€/MWh)")
    host_thermal_demand_kw: float = Field(650.0, ge=50.0, le=10000.0, description="Host max thermal baseload (kWth)")
    heat_sale_price_eur_mwh: float = Field(48.0, ge=10.0, le=150.0, description="Heat replacement value (€/MWhth)")
    capex_base_eur: float = Field(250000.0, ge=0.0, description="Base fixed connection CAPEX (€)")
    capex_per_kw: float = Field(4000.0, ge=500.0, le=5000.0, description="Unit equipment CAPEX (€/kWe)")
    fixed_om_eur_year: float = Field(25000.0, ge=0.0, description="Fixed annual O&M (€/year)")
    variable_om_eur_mwh: float = Field(9.6145, ge=0.0, le=50.0, description="Variable O&M per MWh electric generated (€/MWh_e)")
    parasitic_cooling_kw_per_mw_dumped: float = Field(25.0, ge=0.0, le=100.0, description="Parasitic cooling electric power per MW thermal dumped (kWe/MWth)")


class IndustrialProcessSpec(CfoBaseModel):
    """Standardized industrial process asset specification."""
    process_type: IndustrialProcessType = Field(IndustrialProcessType.BIOCHAR, description="Process typology")
    name: str = Field("Industrial Project", description="Asset / Project name")
    fixed_capex: float = Field(..., gt=0.0, description="Total Fixed CAPEX (€)")
    nwc: float = Field(0.0, ge=0.0, description="Net Working Capital (€)")
    fixed_om_eur_year: float = Field(0.0, ge=0.0, description="Fixed annual O&M (€/year)")
    variable_om_pct_revenue: float = Field(0.02, ge=0.0, le=0.30, description="Variable O&M as % of gross revenue")
    biochar_params: Optional[BiocharProcessParams] = Field(None, description="Biochar parameters if process_type=biochar")
    chp_params: Optional[ChpProcessParams] = Field(None, description="CHP parameters if process_type=chp")


class FinancialParametersSpec(CfoBaseModel):
    """Institutional Project Finance capital structuring and underwriting parameters."""
    senior_debt_share: float = Field(0.60, ge=0.0, le=0.95, description="Senior debt fraction of Total CAPEX (e.g. 0.60)")
    senior_debt_term_years: int = Field(7, ge=1, le=30, description="Senior debt tenor in years")
    senior_debt_interest_rate: float = Field(0.055, ge=0.0, le=0.30, description="Annual senior interest rate (e.g. 0.055)")
    mezzanine_debt_share: float = Field(0.0, ge=0.0, le=0.50, description="Subordinated debt fraction (e.g. 0.0)")
    mezzanine_interest_rate: float = Field(0.09, ge=0.0, le=0.35, description="Mezzanine annual coupon rate")
    corporate_tax_rate: float = Field(0.25, ge=0.0, le=0.50, description="Corporate income tax rate (0.25)")
    depreciation_years: int = Field(10, ge=1, le=35, description="Linear asset depreciation period (years)")
    discount_rate_wacc: float = Field(0.08, ge=0.001, le=0.40, description="WACC discount rate for Project NPV")
    discount_rate_equity: float = Field(0.10, ge=0.001, le=0.40, description="Cost of equity for Equity NPV & Payback")
    covenant_cash_sweep_dscr: float = Field(1.20, ge=1.0, le=1.60, description="DSCR threshold triggering Cash Sweep")
    covenant_default_dscr: float = Field(1.00, ge=0.5, le=1.30, description="DSCR threshold triggering Technical Default")
    cash_sweep_share: float = Field(0.50, ge=0.0, le=1.0, description="Share of residual cash swept to accelerate debt prepayment")
    project_lifetime_years: int = Field(10, ge=1, le=40, description="Total project economic evaluation period (years)")


class AnnualProjection(CfoBaseModel):
    """Granular waterfall line items for a single operating year."""
    year: int
    revenue: float
    opex: float
    ebitda: float
    depreciation: float
    ebit: float
    interest: float
    ebt: float
    tax: float
    cfads: float
    debt_service: float
    principal: float
    remaining_debt: float
    mezzanine_service: float = 0.0
    cash_sweep: float = 0.0
    fcfe: float
    dscr: float
    covenant_breach: bool = False
    default_breach: bool = False


class SensitivityScenario(CfoBaseModel):
    """Results under macro-stress or operational sensitivity shocks."""
    name: str
    ebitda: float
    cfads: float
    min_dscr: float
    avg_dscr: float
    equity_irr: Optional[float] = None
    project_npv: Optional[float] = None
    cash_sweep_triggered: bool = False
    covenant_breach: bool = False
    default_alert: bool = False
    details: Optional[str] = None


class SimulationSummary(CfoBaseModel):
    """Executive KPI summary of the Project Finance simulation."""
    total_capex: float
    capex_fixed: float
    nwc: float
    equity_invested: float
    senior_debt_principal: float
    senior_debt_annual_payment: float
    mezzanine_debt_principal: float = 0.0
    ebitda_base_year1: float
    min_dscr: float
    avg_dscr: float
    equity_irr: Optional[float] = None
    project_irr: Optional[float] = None
    npv_equity: Optional[float] = None
    project_npv: Optional[float] = None
    dynamic_payback_years: Optional[float] = None
    covenant_breaches_count: int = 0
    cash_sweep_triggered: bool = False
    default_alert: bool = False


class CovenantReport(CfoBaseModel):
    """Bankability and covenant compliance diagnostic."""
    min_dscr_covenant: float
    observed_min_dscr: float
    compliance_status: str
    cash_sweep_activated: bool
    default_alert_triggered: bool
    alerts: List[str] = []


class SimulationResult(CfoBaseModel):
    """Comprehensive Project Finance simulation payload."""
    scenario_name: str = "Base Case"
    summary: SimulationSummary
    annual_projections: List[AnnualProjection]
    sensitivities: Dict[str, SensitivityScenario]
    covenants: CovenantReport

    # Convenience properties for flat/frontend consumers
    @property
    def total_capex(self) -> float:
        return self.summary.total_capex

    @property
    def senior_debt_principal(self) -> float:
        return self.summary.senior_debt_principal

    @property
    def annual_cuota(self) -> float:
        return self.summary.senior_debt_annual_payment

    @property
    def equity_invested(self) -> float:
        return self.summary.equity_invested

    @property
    def ebitda_avg(self) -> float:
        return self.summary.ebitda_base_year1

    @property
    def dscr_min(self) -> float:
        return self.summary.min_dscr

    @property
    def dscr_avg(self) -> float:
        return self.summary.avg_dscr

    @property
    def equity_irr_pct(self) -> Optional[float]:
        return round(self.summary.equity_irr * 100.0, 2) if self.summary.equity_irr is not None else None

    @property
    def project_irr_pct(self) -> Optional[float]:
        return round(self.summary.project_irr * 100.0, 2) if self.summary.project_irr is not None else None

    @property
    def npv_equity(self) -> Optional[float]:
        return self.summary.npv_equity

    @property
    def dynamic_payback_years(self) -> Optional[float]:
        return self.summary.dynamic_payback_years

    @property
    def cash_sweep_triggered(self) -> bool:
        return self.summary.cash_sweep_triggered

    @property
    def default_alert(self) -> bool:
        return self.summary.default_alert

    @property
    def schedule(self) -> List[AnnualProjection]:
        return self.annual_projections


class ChpScanPoint(CfoBaseModel):
    """Single capacity point evaluated during CHP power optimization."""
    pe_kw: float
    ebitda: float
    annual_cuota: float
    dscr_avg: float
    dscr_min: float
    equity_irr: Optional[float] = None
    payback_years: Optional[float] = None
    heat_valorized_pct: float
    trap: bool = False
    trap_details: Optional[str] = None


class ChpOptimizationResult(CfoBaseModel):
    """Result of the electrical power capacity scanner and oversizing trap detector."""
    optimal_pe_kw: float
    optimal_equity_irr: Optional[float] = None
    optimal_avg_dscr: float
    optimal_payback_years: Optional[float] = None
    scan_curve: List[ChpScanPoint]
    oversizing_trap_identified: bool = False
    trap_details: Optional[str] = None


__all__ = [
    "IndustrialProcessType",
    "BiocharProcessParams",
    "ChpProcessParams",
    "IndustrialProcessSpec",
    "FinancialParametersSpec",
    "AnnualProjection",
    "SensitivityScenario",
    "SimulationSummary",
    "CovenantReport",
    "SimulationResult",
    "ChpScanPoint",
    "ChpOptimizationResult",
]
