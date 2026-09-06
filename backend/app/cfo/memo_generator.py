"""
Executive Investment Committee Memorandum Generator.

Generates institutional-grade Project Finance Investment Memoranda in Markdown format
from SimulationResult and IndustrialProcessSpec models.

Sections included:
1. Resumen Ejecutivo de la Transacción y Estructura de Capital
2. Indicadores Clave de Rentabilidad y Bancabilidad (Executive KPIs)
3. Cascada de Flujos de Caja Operativos y Servicio de la Deuda (Waterfall Schedule)
4. Matriz de Resiliencia y Análisis de Sensibilidad Multiescenario
5. Diagnóstico de Covenants y Monitoreo de Alertas Tempranas
6. Dictamen y Recomendación para el Comité de Inversiones
"""

import re
from datetime import datetime
from typing import Any, Dict, Optional, Tuple, Union

from app.cfo.specs import (
    FinancialParametersSpec,
    IndustrialProcessSpec,
    IndustrialProcessType,
    SimulationResult,
)


def _format_currency(amount: Optional[float], decimals: int = 0) -> str:
    """Format currency in Euro standard notation (e.g. 3,350,000 €)."""
    if amount is None:
        return "N/A"
    if decimals == 0:
        formatted = f"{amount:,.0f}"
    else:
        formatted = f"{amount:,.{decimals}f}"
    return f"{formatted} €"


def _format_pct(rate: Optional[float], decimals: int = 1) -> str:
    """Format ratio as percentage string (e.g. 17.8%)."""
    if rate is None:
        return "N/A"
    return f"{rate * 100.0:.{decimals}f}%"


def _format_ratio(ratio: Optional[float], decimals: int = 2) -> str:
    """Format coverage ratio (e.g. 1.54x)."""
    if ratio is None:
        return "N/A"
    return f"{ratio:.{decimals}f}x"


def generate_memo_filename(project_name: str, process_type: Union[IndustrialProcessType, str]) -> str:
    """Generate standardized Markdown file name for the memo."""
    p_type = process_type.value if isinstance(process_type, IndustrialProcessType) else str(process_type)
    safe_name = re.sub(r"[^\w\-_]", "_", project_name).strip("_")
    safe_type = re.sub(r"[^\w\-_]", "_", p_type).capitalize()
    return f"Memorando_Ejecutivo_Project_Finance_{safe_type}_{safe_name}.md"


def generate_investment_memo(
    simulation_result: SimulationResult,
    process_spec: IndustrialProcessSpec,
    financial_spec: Optional[FinancialParametersSpec] = None,
) -> Tuple[str, str]:
    """
    Generate comprehensive Investment Committee Memorandum in Markdown format.

    Args:
        simulation_result: Completed SimulationResult with waterfall and sensitivities.
        process_spec: Industrial asset physical and operational specification.
        financial_spec: Project Finance underwriting and capital structuring parameters.

    Returns:
        Tuple[str, str]: (filename, markdown_content)
    """
    summary = simulation_result.summary
    covenants = simulation_result.covenants
    sensitivities = simulation_result.sensitivities
    projections = simulation_result.annual_projections

    p_type = process_spec.process_type
    p_name = process_spec.name or "Proyecto Industrial"
    p_type_label = (
        "Pirólisis de Biomasa & Biochar / CORCs"
        if p_type == IndustrialProcessType.BIOCHAR
        else (
            "Cogeneración Industrial CHP (Combined Heat & Power)"
            if p_type == IndustrialProcessType.CHP
            else "Proceso Industrial Personalizado"
        )
    )

    filename = f"Memorando_Ejecutivo_Project_Finance_{p_type.value.capitalize()}.md"
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Capital structure figures
    total_capex = summary.total_capex
    fixed_capex = summary.capex_fixed
    nwc = summary.nwc
    senior_principal = summary.senior_debt_principal
    senior_cuota = summary.senior_debt_annual_payment
    mezz_principal = summary.mezzanine_debt_principal
    equity = summary.equity_invested

    senior_pct = (senior_principal / total_capex) if total_capex > 0 else 0.0
    mezz_pct = (mezz_principal / total_capex) if total_capex > 0 else 0.0
    equity_pct = (equity / total_capex) if total_capex > 0 else 0.0

    # Tenor and interest rate
    senior_tenor = financial_spec.senior_debt_term_years if financial_spec else 7
    senior_rate = financial_spec.senior_debt_interest_rate if financial_spec else 0.055

    # Process-specific technical summary
    tech_summary = ""
    if p_type == IndustrialProcessType.BIOCHAR and process_spec.biochar_params:
        bp = process_spec.biochar_params
        annual_feed = bp.feedstock_input_t_day * bp.operating_days_year
        tech_summary = (
            f"- **Capacidad de Ingestión Nominal**: {bp.feedstock_input_t_day:.1f} t/día biomasa "
            f"({annual_feed:,.0f} t/año @ {bp.operating_days_year} días/año).\n"
            f"- **Temperatura de Reactor**: {bp.pyrolysis_temp_c:.0f} °C | "
            f"Fugas de O₂: {bp.oxygen_leak_pct:.1f}% | Humedad: {bp.feedstock_moisture_pct:.1f}%.\n"
            f"- **Precio Biochar**: {_format_currency(bp.char_sale_price_eur_ton)}/t | "
            f"Certificados CORC: {_format_currency(bp.corc_price_eur_tco2e)}/tCO₂e "
            f"(Rendimiento: {bp.corc_yield_tco2e_per_ton_char:.2f} tCO₂e/t char)."
        )
    elif p_type == IndustrialProcessType.CHP and process_spec.chp_params:
        cp = process_spec.chp_params
        tech_summary = (
            f"- **Potencia Eléctrica Instalada ($P_e$)**: {cp.electrical_capacity_kw:.0f} kWe | "
            f"Horas Equivalentes: {cp.operating_hours_year:,} h/año.\n"
            f"- **Eficiencia Eléctrica (PCI)**: {_format_pct(cp.electrical_efficiency)} | "
            f"Eficiencia Térmica (PCI): {_format_pct(cp.thermal_efficiency)}.\n"
            f"- **Demanda Térmica Host Máxima**: {cp.host_thermal_demand_kw:.0f} kWth | "
            f"Tarifa Electricidad: {_format_currency(cp.electricity_sale_price_eur_mwh, 2)}/MWh | "
            f"Coste Gas: {_format_currency(cp.fuel_cost_eur_mwh_lhv, 2)}/MWh PCI."
        )
    else:
        tech_summary = (
            f"- **Activo**: {p_name} ({p_type_label}).\n"
            f"- **CAPEX Fijo**: {_format_currency(fixed_capex)} | NWC Inicial: {_format_currency(nwc)}.\n"
            f"- **O&M Fijo Anual**: {_format_currency(process_spec.fixed_om_eur_year)}/año."
        )

    # Status verdict badge
    if covenants.default_alert_triggered:
        verdict = "❌ DESFAVORABLE / ALERTA DE DEFAULT TÉCNICO"
        verdict_desc = (
            "El proyecto presenta vulnerabilidad crítica en el servicio de deuda (DSCR < 1.00x) "
            "bajo los escenarios evaluados. Requiere reestructuración de apalancamiento o inyección adicional de equity."
        )
    elif covenants.cash_sweep_activated:
        verdict = "⚠️ CONDICIONADO / ACTIVACIÓN DE CASH SWEEP"
        verdict_desc = (
            "El proyecto es viable pero activa el mecanismo de Cash Sweep de deuda senior (DSCR < 1.20x). "
            "Se requiere constitución de cuenta de reserva DSRA de 6 meses y barrido del 50% de flujos residuales."
        )
    else:
        verdict = "✅ FAVORABLE / APTO PARA FINANCIACIÓN BANCARIA"
        verdict_desc = (
            "El proyecto supera holgadamente los covenants de bancabilidad (DSCR promedio > 1.40x y mínimo > 1.20x), "
            "mostrando robustez financiera y cobertura adecuada del servicio de la deuda."
        )

    # Build Markdown
    lines = [
        "# MEMORANDO EJECUTIVO DE PROJECT FINANCE",
        "## COMITÉ DE INVERSIONES & CRÉDITO INSTITUCIONAL",
        "",
        f"**Fecha de Emisión**: {today_str}  ",
        f"**Activo / Proyecto**: {p_name}  ",
        f"**Tipología Industrial**: {p_type_label}  ",
        f"**Dictamen Preliminar**: {verdict}  ",
        "",
        "---",
        "",
        "## 1. RESUMEN DE LA TRANSACCIÓN Y ESTRUCTURA DE CAPITAL",
        "",
        f"Se presenta al Comité de Inversiones la estructuración de Project Finance "
        f"para la ejecución del proyecto **{p_name}**, correspondiente a un activo de {p_type_label}. "
        f"La inversión total requerida asciende a **{_format_currency(total_capex)}** "
        f"(desglosada en **{_format_currency(fixed_capex)}** de CAPEX Fijo EPC y **{_format_currency(nwc)}** "
        f"de Capital de Trabajo Neto - NWC).",
        "",
        "### Parámetros Técnicos y Operativos Clave",
        tech_summary,
        "",
        "### Estructura de Capital y Fuentes de Financiación",
        "",
        "| Tramo de Capital | Importe (€) | Participación (%) | Condiciones Financieras |",
        "| :--- | :--- | :--- | :--- |",
        f"| **Deuda Senior** | {_format_currency(senior_principal)} | {_format_pct(senior_pct)} | "
        f"Plazo {senior_tenor} años, Tipo {_format_pct(senior_rate)}, Amortización Francesa |",
    ]

    if mezz_principal > 0:
        mezz_rate = financial_spec.mezzanine_interest_rate if financial_spec else 0.09
        lines.append(
            f"| **Deuda Mezzanine** | {_format_currency(mezz_principal)} | {_format_pct(mezz_pct)} | "
            f"Cupón anual {_format_pct(mezz_rate)}, Subordinada |"
        )

    lines.extend([
        f"| **Equity Promotor** | {_format_currency(equity)} | {_format_pct(equity_pct)} | "
        f"Capital propio aportado al cierre financiero |",
        f"| **TOTAL FUENTES** | **{_format_currency(total_capex)}** | **100.0%** | "
        f"Cuota Anual Deuda Senior: **{_format_currency(senior_cuota)}/año** |",
        "",
        "---",
        "",
        "## 2. INDICADORES CLAVE DE RENTABILIDAD Y BANCABILIDAD (KPIS)",
        "",
        "| Indicador Financiero | Valor Caso Base | Benchmark / Requisito | Evaluación |",
        "| :--- | :--- | :--- | :--- |",
        f"| **EBITDA Operativo Año 1** | {_format_currency(summary.ebitda_base_year1)} | "
        f"> 0 € | {'✅ Positivo' if summary.ebitda_base_year1 > 0 else '❌ Negativo'} |",
        f"| **DSCR Mínimo (Tenor Deuda)** | {_format_ratio(summary.min_dscr)} | "
        f"≥ 1.20x | {'✅ Bancable' if summary.min_dscr >= 1.20 else ('⚠️ Sweep' if summary.min_dscr >= 1.00 else '❌ Default')} |",
        f"| **DSCR Promedio** | {_format_ratio(summary.avg_dscr)} | "
        f"≥ 1.35x | {'✅ Saludable' if summary.avg_dscr >= 1.35 else '⚠️ Ajustado'} |",
        f"| **TIR del Accionista (Equity IRR)** | {_format_pct(summary.equity_irr)} | "
        f"≥ 12.0% | {'✅ Excelente' if (summary.equity_irr or 0) >= 0.15 else ('🟡 Moderado' if (summary.equity_irr or 0) >= 0.10 else '❌ Insuficiente')} |",
        f"| **TIR del Proyecto (Project IRR)** | {_format_pct(summary.project_irr)} | "
        f"WACC + Spread | {'✅ Rentable' if (summary.project_irr or 0) > 0.08 else '⚠️ Bajo'} |",
        f"| **VAN Accionista (Equity NPV)** | {_format_currency(summary.npv_equity)} | "
        f"> 0 € | {'✅ Creación de Valor' if (summary.npv_equity or 0) > 0 else '❌ Destrucción de Valor'} |",
        f"| **Payback Dinámico Descontado** | {f'{summary.dynamic_payback_years:.1f} años' if summary.dynamic_payback_years else 'N/A'} | "
        f"≤ {senior_tenor} años | {'✅ Recuperable' if summary.dynamic_payback_years and summary.dynamic_payback_years <= senior_tenor else '⚠️ Dilatado'} |",
        "",
        "---",
        "",
        "## 3. CASCADA DE FLUJOS Y SERVICIO DE LA DEUDA (WATERFALL)",
        "",
        "La amortización de la deuda senior sigue un cronograma francés con cuota fija anual constante, "
        "minimizando el coste financiero total mediante la reducción progresiva de la carga de intereses. "
        "El Flujo de Caja Disponible para el Servicio de la Deuda (**CFADS**) incorpora la deducción "
        "del Impuesto de Sociedades efectivo con compensación de bases imponibles negativas (BINS).",
        "",
        "| Año | Ingresos (€) | OPEX (€) | EBITDA (€) | Deprec. (€) | Impuestos (€) | CFADS (€) | Cuota Senior (€) | Saldo Deuda (€) | FCFE (€) | DSCR |",
        "| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |",
    ])

    for p in projections:
        flag = " ⚠️" if p.covenant_breach else ""
        if p.default_breach:
            flag = " ❌"
        lines.append(
            f"| {p.year} | {p.revenue:,.0f} | {p.opex:,.0f} | {p.ebitda:,.0f} | {p.depreciation:,.0f} | "
            f"{p.tax:,.0f} | {p.cfads:,.0f} | {p.debt_service:,.0f} | {p.remaining_debt:,.0f} | "
            f"{p.fcfe:,.0f} | {p.dscr:.2f}x{flag} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 4. ANÁLISIS DE RESILIENCIA Y MATRIZ DE ESTRÉS",
        "",
        "Para contrastar la fortaleza de la estructura financiera, el modelo somete el activo "
        "a perturbaciones macroeconómicas simultáneas (caída de precios de venta, incremento en costes "
        "de aprovisionamiento y reducción de disponibilidad de planta):",
        "",
        "| Escenario Evaluado | EBITDA (€) | CFADS (€) | DSCR Mín | DSCR Prom | TIR Equity (%) | Estado de Covenants |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
        f"| **Caso Base** | {_format_currency(summary.ebitda_base_year1)} | "
        f"{_format_currency(projections[0].cfads if projections else 0.0)} | "
        f"{_format_ratio(summary.min_dscr)} | {_format_ratio(summary.avg_dscr)} | "
        f"{_format_pct(summary.equity_irr)} | {'✅ Cumple Covenants' if not covenants.cash_sweep_activated else '⚠️ Cash Sweep'} |",
    ])

    for sc_key, sc in sensitivities.items():
        sc_status = "❌ DEFAULT TÉCNICO" if sc.default_alert else (
            "⚠️ CASH SWEEP ACTIVADO" if sc.cash_sweep_triggered else "✅ CUMPLIMIENTO ÍNTEGRO"
        )
        lines.append(
            f"| **{sc.name}** | {_format_currency(sc.ebitda)} | {_format_currency(sc.cfads)} | "
            f"{_format_ratio(sc.min_dscr)} | {_format_ratio(sc.avg_dscr)} | "
            f"{_format_pct(sc.equity_irr)} | {sc_status} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 5. DIAGNÓSTICO DE COVENANTS Y ALERTAS TEMPRANAS",
        "",
        f"- **Umbral de Activación de Cash Sweep**: DSCR < {_format_ratio(covenants.min_dscr_covenant)} "
        f"(Retención del 50% de excesos de caja para prepago de principal).",
        f"- **Umbral de Alerta de Default Técnico**: DSCR < 1.00x "
        f"(Incapacidad de servicio de deuda corriente con flujos operativos).",
        f"- **DSCR Mínimo Observado en Caso Base**: **{_format_ratio(covenants.observed_min_dscr)}**.",
        f"- **Estado General de Cumplimiento**: **{covenants.compliance_status}**.",
        "",
    ])

    if covenants.alerts:
        lines.append("### Alertas Específicas Detectadas:")
        for alert in covenants.alerts:
            lines.append(f"- ⚠️ {alert}")
        lines.append("")
    else:
        lines.append("No se registraron alertas de infracción de covenants en el Caso Base.\n")

    lines.extend([
        "---",
        "",
        "## 6. DICTAMEN Y RECOMENDACIÓN AL COMITÉ DE INVERSIONES",
        "",
        f"**Dictamen Final**: {verdict}",
        "",
        verdict_desc,
        "",
        "### Condiciones Precedentes y Medidas Mitigantes Obligatorias:",
        f"1. **Constitución de DSRA (Debt Service Reserve Account)**: Fondo de reserva equivalente a 6 meses de servicio "
        f"de deuda ({_format_currency(senior_cuota / 2.0)}) dotado en la fecha de cierre financiero.",
        "2. **Cobertura de Riesgos Operativos y de Mercado**: Formalización de contratos de offtake a precio cerrado o "
        "suelo para los flujos principales (Biochar / Certificados CORC o Acuerdos PPA / Suministro Térmico Host).",
        "3. **Pólizas de Seguro EPC y Pérdida de Beneficios**: Cobertura de garantía de rendimiento técnico de planta y seguro ALOP.",
        "4. **Mecanismo de Cash Sweep Contractual**: Aplicación estricta de barrido del 50% de caja libre hacia la deuda "
        "si el DSCR anual auditado desciende por debajo de 1.20x.",
        "",
        "---",
        "",
        "*Memorando emitido automáticamente por el Motor Cuantitativo CFO Project Finance de Nexo Sinérgico bajo arquitectura SDD.*",
    ])

    markdown_content = "\n".join(lines)
    return filename, markdown_content


def export_memo(
    process_spec: IndustrialProcessSpec,
    financial_spec: FinancialParametersSpec,
) -> Dict[str, str]:
    """
    Convenience orchestrator that executes the simulation and outputs the memo payload.

    Returns:
        Dict[str, str]: {"filename": filename, "markdown_content": markdown_content}
    """
    from app.cfo.core_engine import simulate_project_finance

    sim_result = simulate_project_finance(process_spec, financial_spec)
    filename, markdown_content = generate_investment_memo(sim_result, process_spec, financial_spec)
    return {
        "filename": filename,
        "markdown_content": markdown_content,
    }


__all__ = [
    "generate_investment_memo",
    "generate_memo_filename",
    "export_memo",
]
