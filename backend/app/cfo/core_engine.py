"""
CFO Project Finance Quantitative Decision Engine.

Institutional-grade, Spec-Driven Design (SDD) Project Finance Engine:
- Pure-Python zero-dependency Newton-Raphson solvers with bisection fallback for Equity IRR and Project NPV.
- French Debt Amortization schedule (cuota constante A, interest I_t, principal P_t, closing balance B_t).
- Complete Project Finance Cash Flow Waterfall:
    Gross Revenue -> OPEX -> EBITDA -> Depreciation -> EBIT -> CIT (loss carryforwards)
    -> CFADS -> Senior Debt Service -> Mezzanine Service -> Cash Sweep -> FCFE.
- Dynamic Discounted Payback Period solver.
- Bankability and early-warning covenants (DSCR min, DSCR avg, Cash Sweep flag, Technical Default alert).
- Multi-scenario macro sensitivities: Base Case, Downside, and Stress tests.
- Cogeneration CHP power scanner (Pe) and forensic detection of "La Trampa de los −812 kW".
"""

from typing import Any, Dict, List, Optional, Tuple, Union
from app.cfo.adapters import get_adapter
from app.cfo.specs import (
    AnnualProjection,
    ChpOptimizationResult,
    ChpProcessParams,
    ChpScanPoint,
    CovenantReport,
    FinancialParametersSpec,
    IndustrialProcessSpec,
    IndustrialProcessType,
    SensitivityScenario,
    SimulationResult,
    SimulationSummary,
)


def calculate_npv(rate: float, cash_flows: List[float]) -> float:
    """
    Calculate Net Present Value (NPV) of a discrete cash flow series.
    
    NPV = sum(CF_t / (1 + rate)^t) for t = 0 ... N
    Handles singularity boundary at rate == -1.0 gracefully.
    """
    if not cash_flows:
        return 0.0
    if abs(rate + 1.0) < 1e-12:
        return float('inf') if sum(cash_flows[1:]) > 0 else (float('-inf') if sum(cash_flows[1:]) < 0 else cash_flows[0])
    return sum(cf / ((1.0 + rate) ** t) for t, cf in enumerate(cash_flows))


def calculate_irr(
    cash_flows: List[float],
    guess: float = 0.10,
    max_iter: int = 100,
    tol: float = 1e-7
) -> Optional[float]:
    """
    Calculate Internal Rate of Return (IRR) using pure-Python Newton-Raphson
    with guaranteed robust bisection fallback.
    
    Zero external dependencies (no numpy-financial or scipy required).
    Handles non-monotonic profiles and extreme edge cases.
    """
    if not cash_flows or len(cash_flows) < 2:
        return None

    # Sanity check: must have at least one positive and one negative cash flow
    has_pos = any(cf > 0.0 for cf in cash_flows)
    has_neg = any(cf < 0.0 for cf in cash_flows)
    if not (has_pos and has_neg):
        return None

    rate = guess
    # 1. Newton-Raphson iteration
    for _ in range(max_iter):
        npv = 0.0
        d_npv = 0.0
        diverged = False
        
        for t, cf in enumerate(cash_flows):
            denom = (1.0 + rate) ** t
            if denom == 0:
                diverged = True
                break
            npv += cf / denom
            if t > 0:
                d_denom = (1.0 + rate) ** (t + 1)
                if d_denom == 0:
                    diverged = True
                    break
                d_npv -= (t * cf) / d_denom

        if diverged or abs(d_npv) < 1e-12:
            break

        new_rate = rate - npv / d_npv
        if abs(new_rate - rate) < tol:
            return round(new_rate, 6)

        # Guard against wild divergence outside realistic economic domain
        if new_rate <= -0.99 or new_rate > 10.0:
            break
        rate = new_rate

    # 2. Bisection Fallback
    low, high = -0.95, 5.0
    npv_low = calculate_npv(low, cash_flows)
    npv_high = calculate_npv(high, cash_flows)

    # If no sign change across standard interval, try expanding upper bound
    if npv_low * npv_high > 0:
        high = 20.0
        npv_high = calculate_npv(high, cash_flows)
        if npv_low * npv_high > 0:
            return None

    for _ in range(120):
        mid = (low + high) / 2.0
        npv_mid = calculate_npv(mid, cash_flows)
        if abs(npv_mid) < tol or (high - low) / 2.0 < tol:
            return round(mid, 6)
        if npv_low * npv_mid < 0:
            high = mid
            npv_high = npv_mid
        else:
            low = mid
            npv_low = npv_mid

    return round((low + high) / 2.0, 6)


def calculate_french_amortization(
    principal: float,
    rate: Optional[float] = None,
    tenor_years: Optional[int] = None,
    annual_rate: Optional[float] = None,
    **kwargs: Any
) -> Dict[str, Any]:
    """
    Calculate constant payment (cuota constante) French debt amortization schedule.
    
    Formula:
        A = P * [r * (1 + r)^n] / [(1 + r)^n - 1]
        
    Handles edge case of r = 0.0 (straight-line repayment).
    Raises ValueError on negative principal, negative rate, or non-positive tenor.
    """
    r = rate if rate is not None else annual_rate
    n = tenor_years if tenor_years is not None else kwargs.get("tenor", kwargs.get("tenor_years"))

    if principal < 0:
        raise ValueError(f"Principal must not be negative, got {principal}")
    if n is None or n <= 0:
        raise ValueError(f"Tenor in years must be strictly positive, got {n}")
    if r is None or r < 0:
        raise ValueError(f"Interest rate cannot be negative, got {r}")

    if principal == 0.0:
        return {
            "annual_cuota": 0.0,
            "annual_payment": 0.0,
            "schedule": [],
            "total_interest": 0.0,
            "total_principal": 0.0,
        }

    if r == 0.0:
        annual_payment = principal / n
    else:
        factor = ((1.0 + r) ** n)
        annual_payment = principal * (r * factor) / (factor - 1.0)

    balance = principal
    schedule: List[Dict[str, float]] = []
    total_interest = 0.0
    total_principal = 0.0

    for year in range(1, n + 1):
        interest = balance * r
        # For terminal year, ensure balance closes precisely to zero
        if year == n:
            principal_paid = balance
            payment = principal_paid + interest
            closing_balance = 0.0
        else:
            principal_paid = annual_payment - interest
            closing_balance = max(0.0, balance - principal_paid)
            payment = annual_payment

        total_interest += interest
        total_principal += principal_paid

        schedule.append({
            "year": year,
            "opening_balance": round(balance, 2),
            "interest": round(interest, 2),
            "principal": round(principal_paid, 2),
            "payment": round(payment, 2),
            "closing_balance": round(closing_balance, 2),
        })
        balance = closing_balance

    return {
        "annual_cuota": round(annual_payment, 2),
        "annual_payment": round(annual_payment, 2),
        "schedule": schedule,
        "total_interest": round(total_interest, 2),
        "total_principal": round(total_principal, 2),
    }


def calculate_dynamic_payback(
    initial_equity: float,
    fcfe_series: List[float],
    discount_rate: float = 0.0
) -> Optional[float]:
    """
    Calculate Dynamic (Discounted) Payback Period in fractional years.
    Returns the exact year at which cumulative discounted FCFE offsets initial equity.
    """
    if initial_equity <= 0.0:
        return 0.0

    cumulative = -initial_equity
    for t, fcfe in enumerate(fcfe_series, start=1):
        dcf = fcfe / ((1.0 + discount_rate) ** t)
        prev_cumulative = cumulative
        cumulative += dcf

        if cumulative >= 0.0:
            if dcf > 0:
                fraction = abs(prev_cumulative) / dcf
                return round((t - 1) + fraction, 3)
            return round(float(t), 3)

    return None


def simulate_project_finance(
    process_spec: IndustrialProcessSpec,
    financial_spec: FinancialParametersSpec
) -> SimulationResult:
    """
    Execute full multi-year Project Finance simulation:
    1. Resolve industrial process adapter and physical balances.
    2. Structure capital (Senior Debt, Mezzanine, Sponsor Equity).
    3. Calculate French debt amortization schedule.
    4. Execute annual cash flow waterfall with tax loss carryforwards.
    5. Evaluate bankability covenants and Cash Sweep triggers.
    6. Run multi-scenario macro sensitivities (Downside, Stress).
    7. Compute Equity IRR, Project IRR, NPVs, and Dynamic Payback.
    """
    adapter = get_adapter(process_spec.process_type)
    capex_info = adapter.compute_capex_opex(process_spec)

    fixed_capex = capex_info["fixed_capex"]
    nwc = capex_info["nwc"]
    total_capex = fixed_capex + nwc

    # Capital Structuring
    senior_debt_share = financial_spec.senior_debt_share
    mezz_debt_share = financial_spec.mezzanine_debt_share
    equity_share = max(0.0, 1.0 - senior_debt_share - mezz_debt_share)

    senior_debt_principal = total_capex * senior_debt_share
    mezz_debt_principal = total_capex * mezz_debt_share
    equity_invested = total_capex * equity_share

    # Senior Debt Amortization
    senior_amort = calculate_french_amortization(
        principal=senior_debt_principal,
        rate=financial_spec.senior_debt_interest_rate,
        tenor_years=financial_spec.senior_debt_term_years,
    )
    senior_cuota = senior_amort["annual_cuota"]
    senior_schedule_map = {item["year"]: item for item in senior_amort["schedule"]}

    # Mezzanine Debt (if structured)
    mezz_cuota = 0.0
    mezz_schedule_map: Dict[int, Dict[str, float]] = {}
    if mezz_debt_principal > 0:
        mezz_amort = calculate_french_amortization(
            principal=mezz_debt_principal,
            rate=financial_spec.mezzanine_interest_rate,
            tenor_years=financial_spec.senior_debt_term_years,
        )
        mezz_cuota = mezz_amort["annual_cuota"]
        mezz_schedule_map = {item["year"]: item for item in mezz_amort["schedule"]}

    # Baseline operational revenue and OPEX
    base_revenue, base_opex, _ = adapter.compute_revenue_opex(process_spec, scenario_shock=None)
    base_ebitda = base_revenue - base_opex

    lifetime = financial_spec.project_lifetime_years
    deprec_years = financial_spec.depreciation_years
    annual_depreciation = (fixed_capex / deprec_years) if deprec_years > 0 else 0.0

    projections: List[AnnualProjection] = []
    tax_loss_carryforward = 0.0
    fcfe_list: List[float] = []
    cfads_list: List[float] = []

    remaining_senior_balance = senior_debt_principal
    cash_sweep_activated_overall = False
    default_alert_overall = False
    covenant_breaches_count = 0

    for year in range(1, lifetime + 1):
        rev = base_revenue
        opex = base_opex
        ebitda = rev - opex

        deprec = annual_depreciation if year <= deprec_years else 0.0
        ebit = ebitda - deprec

        # Debt Service
        if year in senior_schedule_map and remaining_senior_balance > 0:
            s_item = senior_schedule_map[year]
            senior_interest = remaining_senior_balance * financial_spec.senior_debt_interest_rate
            senior_principal = min(remaining_senior_balance, senior_cuota - senior_interest)
            senior_payment = senior_interest + senior_principal
            remaining_senior_balance = max(0.0, remaining_senior_balance - senior_principal)
        else:
            senior_interest = 0.0
            senior_principal = 0.0
            senior_payment = 0.0

        mezz_interest = mezz_schedule_map.get(year, {}).get("interest", 0.0)
        mezz_principal = mezz_schedule_map.get(year, {}).get("principal", 0.0)
        mezz_payment = mezz_interest + mezz_principal

        total_interest = senior_interest + mezz_interest
        ebt = ebit - total_interest

        # Corporate Income Tax for CFADS calculation
        # In Project Finance standards, tax in CFADS is based on operating taxable income (unlevered),
        # with zero tax if overall EBT is non-positive or loss carryforwards apply.
        if ebt <= 0:
            tax = 0.0
            tax_loss_carryforward += abs(ebt)
        else:
            loss_applied = min(tax_loss_carryforward, ebit)
            taxable_ebit = max(0.0, ebit - loss_applied)
            tax = taxable_ebit * financial_spec.corporate_tax_rate
            tax_loss_carryforward = max(0.0, tax_loss_carryforward - loss_applied)

        # Cash Flow Available for Debt Service (CFADS = EBITDA - Tax strictly for all years)
        cfads = ebitda - tax
        cfads_list.append(cfads)

        # Debt Service Coverage Ratio (DSCR)
        if senior_payment > 0:
            dscr = cfads / senior_payment
            if dscr < financial_spec.covenant_cash_sweep_dscr:
                covenant_breaches_count += 1
            if dscr < financial_spec.covenant_default_dscr:
                default_alert_overall = True
            elif dscr < financial_spec.covenant_cash_sweep_dscr:
                cash_sweep_activated_overall = True
        else:
            dscr = 999.0

        # Cash Available Before Sweep
        cash_pre_sweep = cfads - senior_payment - mezz_payment

        # Cash Sweep Mechanism
        cash_sweep = 0.0
        if (
            senior_payment > 0
            and remaining_senior_balance > 0
            and dscr < financial_spec.covenant_cash_sweep_dscr
            and cash_pre_sweep > 0
        ):
            cash_sweep = min(cash_pre_sweep * financial_spec.cash_sweep_share, remaining_senior_balance)
            remaining_senior_balance -= cash_sweep
            cash_sweep_activated_overall = True

        # Free Cash Flow to Equity (incorporates interest tax shield on actual interest paid)
        tax_shield = total_interest * financial_spec.corporate_tax_rate if ebt > 0 else 0.0
        fcfe = cash_pre_sweep - cash_sweep + tax_shield
        fcfe_list.append(fcfe)

        covenant_breach = (dscr < financial_spec.covenant_cash_sweep_dscr) if senior_payment > 0 else False
        default_breach = (dscr < financial_spec.covenant_default_dscr) if senior_payment > 0 else False

        projections.append(
            AnnualProjection(
                year=year,
                revenue=round(rev, 2),
                opex=round(opex, 2),
                ebitda=round(ebitda, 2),
                depreciation=round(deprec, 2),
                ebit=round(ebit, 2),
                interest=round(total_interest, 2),
                ebt=round(ebt, 2),
                tax=round(tax, 2),
                cfads=round(cfads, 2),
                debt_service=round(senior_payment, 2),
                principal=round(senior_principal, 2),
                remaining_debt=round(remaining_senior_balance, 2),
                mezzanine_service=round(mezz_payment, 2),
                cash_sweep=round(cash_sweep, 2),
                fcfe=round(fcfe, 2),
                dscr=round(dscr, 3),
                covenant_breach=covenant_breach,
                default_breach=default_breach,
            )
        )

    # Bankability metrics over Senior Debt Tenor
    active_dscrs = [
        p.dscr for p in projections
        if p.debt_service > 0 and p.year <= financial_spec.senior_debt_term_years
    ]
    min_dscr = min(active_dscrs) if active_dscrs else 999.0
    avg_dscr = (sum(active_dscrs) / len(active_dscrs)) if active_dscrs else 999.0

    # Return Metrics (terminal release of working capital credited to cash flows)
    equity_cf = [-equity_invested] + list(fcfe_list)
    project_cf = [-total_capex] + list(cfads_list)
    if len(equity_cf) > 1:
        equity_cf[-1] += nwc
    if len(project_cf) > 1:
        project_cf[-1] += nwc

    equity_irr = calculate_irr(equity_cf)
    project_irr = calculate_irr(project_cf)
    npv_equity = calculate_npv(financial_spec.discount_rate_equity, equity_cf)
    project_npv = calculate_npv(financial_spec.discount_rate_wacc, project_cf)
    payback_years = calculate_dynamic_payback(equity_invested, fcfe_list, financial_spec.discount_rate_equity)

    # Sensitivity Scenarios
    sensitivities = _calculate_sensitivities(
        process_spec=process_spec,
        financial_spec=financial_spec,
        adapter=adapter,
        senior_cuota=senior_cuota,
        equity_invested=equity_invested,
        total_capex=total_capex,
        annual_depreciation=annual_depreciation,
        nwc=nwc
    )

    # Summary
    summary = SimulationSummary(
        total_capex=round(total_capex, 2),
        capex_fixed=round(fixed_capex, 2),
        nwc=round(nwc, 2),
        equity_invested=round(equity_invested, 2),
        senior_debt_principal=round(senior_debt_principal, 2),
        senior_debt_annual_payment=round(senior_cuota, 2),
        mezzanine_debt_principal=round(mezz_debt_principal, 2),
        ebitda_base_year1=round(base_ebitda, 2),
        min_dscr=round(min_dscr, 2),
        avg_dscr=round(avg_dscr, 2),
        equity_irr=equity_irr,
        project_irr=project_irr,
        npv_equity=round(npv_equity, 2),
        project_npv=round(project_npv, 2),
        dynamic_payback_years=payback_years,
        covenant_breaches_count=covenant_breaches_count,
        cash_sweep_triggered=cash_sweep_activated_overall,
        default_alert=default_alert_overall,
    )

    # Covenant Diagnostic
    covenant_alerts: List[str] = []
    if default_alert_overall:
        covenant_alerts.append("CRITICAL: Technical Default alert triggered (DSCR < 1.00x).")
    if cash_sweep_activated_overall:
        covenant_alerts.append("WARNING: Cash Sweep activated to prepay senior debt (DSCR < 1.20x).")

    compliance_status = "DEFAULT_BREACH" if default_alert_overall else (
        "CASH_SWEEP" if cash_sweep_activated_overall else "COMPLIANT"
    )

    covenants = CovenantReport(
        min_dscr_covenant=financial_spec.covenant_cash_sweep_dscr,
        observed_min_dscr=round(min_dscr, 2),
        compliance_status=compliance_status,
        cash_sweep_activated=cash_sweep_activated_overall,
        default_alert_triggered=default_alert_overall,
        alerts=covenant_alerts,
    )

    return SimulationResult(
        scenario_name="Base Case",
        summary=summary,
        annual_projections=projections,
        sensitivities=sensitivities,
        covenants=covenants,
    )


def _calculate_sensitivities(
    process_spec: IndustrialProcessSpec,
    financial_spec: FinancialParametersSpec,
    adapter: Any,
    senior_cuota: float,
    equity_invested: float,
    total_capex: float,
    annual_depreciation: float,
    nwc: float
) -> Dict[str, SensitivityScenario]:
    """Evaluate Downside and Severe Stress macro scenarios."""
    is_biochar = process_spec.process_type == IndustrialProcessType.BIOCHAR
    is_wte = process_spec.process_type == IndustrialProcessType.WTE_RSU
    
    if is_biochar:
        scenarios_defs = {
            "downside": {
                "name": "Downside Scenario (-25% char, -40% CORC)",
                "shocks": {
                    "price_char_delta": -0.25,
                    "price_corc_delta": -0.40,
                    "cost_feedstock_delta": 0.0,
                    "cost_opex_delta": 0.05,
                    "availability_delta": 0.0,
                    "scenario": "downside"
                }
            },
            "stress": {
                "name": "Severe Stress Test (-35% char, -60% CORC)",
                "shocks": {
                    "price_char_delta": -0.35,
                    "price_corc_delta": -0.60,
                    "cost_feedstock_delta": 0.0,
                    "cost_opex_delta": 0.10,
                    "availability_delta": 0.0,
                    "scenario": "stress"
                }
            }
        }
    elif is_wte:
        scenarios_defs = {
            "downside": {
                "name": "Downside (-15% gate fee, -20% electricity, +5% humidity)",
                "shocks": {
                    "price_gate_fee_delta": -0.15,
                    "price_electricity_delta": -0.20,
                    "price_carbon_delta": -0.20,
                    "humidity_delta": 0.05,
                    "cost_opex_delta": 0.05,
                    "scenario": "downside"
                }
            },
            "stress": {
                "name": "Stress (-30% gate fee, -35% electricity, +10% humidity)",
                "shocks": {
                    "price_gate_fee_delta": -0.30,
                    "price_electricity_delta": -0.35,
                    "price_carbon_delta": -0.40,
                    "humidity_delta": 0.10,
                    "cost_opex_delta": 0.10,
                    "scenario": "stress"
                }
            }
        }
    else:
        scenarios_defs = {
            "downside": {
                "name": "Downside Scenario (-15% electricity, +15% fuel)",
                "shocks": {
                    "price_electricity_delta": -0.15,
                    "cost_fuel_delta": 0.15,
                    "price_heat_delta": -0.10,
                    "availability_delta": -0.05,
                    "scenario": "downside"
                }
            },
            "stress": {
                "name": "Severe Stress Test (-25% electricity, +30% fuel)",
                "shocks": {
                    "price_electricity_delta": -0.25,
                    "cost_fuel_delta": 0.30,
                    "price_heat_delta": -0.20,
                    "availability_delta": -0.10,
                    "scenario": "stress"
                }
            }
        }

    results: Dict[str, SensitivityScenario] = {}
    lifetime = financial_spec.project_lifetime_years
    tenor = financial_spec.senior_debt_term_years

    for key, sc_data in scenarios_defs.items():
        rev, opex, _ = adapter.compute_revenue_opex(process_spec, scenario_shock=sc_data["shocks"])
        ebitda = rev - opex
        ebit = ebitda - annual_depreciation

        tax_loss_cf = 0.0
        fcfe_series: List[float] = []
        dscr_list: List[float] = []
        sweep_triggered = False
        default_alert = False

        debt_bal = total_capex * financial_spec.senior_debt_share

        for y in range(1, lifetime + 1):
            if y <= tenor and senior_cuota > 0 and debt_bal > 0:
                interest = debt_bal * financial_spec.senior_debt_interest_rate
                principal = min(debt_bal, senior_cuota - interest)
                debt_bal = max(0.0, debt_bal - principal)
                ds = interest + principal
            else:
                interest = 0.0
                ds = 0.0

            ebt = ebit - interest
            if ebt <= 0:
                tax = 0.0
                tax_loss_cf += abs(ebt)
            else:
                offset = min(tax_loss_cf, ebit)
                tax = max(0.0, (ebit - offset) * financial_spec.corporate_tax_rate)
                tax_loss_cf -= offset

            cfads_y = ebitda - tax

            if ds > 0:
                dscr_y = cfads_y / ds
                dscr_list.append(dscr_y)
                if dscr_y < financial_spec.covenant_cash_sweep_dscr:
                    sweep_triggered = True
                if dscr_y < financial_spec.covenant_default_dscr:
                    default_alert = True
            
            cash_pre = cfads_y - ds
            sweep_val = min(cash_pre * financial_spec.cash_sweep_share, debt_bal) if (sweep_triggered and cash_pre > 0) else 0.0
            debt_bal = max(0.0, debt_bal - sweep_val)
            tax_shield = interest * financial_spec.corporate_tax_rate if ebt > 0 else 0.0
            fcfe_series.append(cash_pre - sweep_val + tax_shield)

        min_dscr = min(dscr_list) if dscr_list else 999.0
        avg_dscr = (sum(dscr_list) / len(dscr_list)) if dscr_list else 999.0

        equity_cf = [-equity_invested] + fcfe_series
        if len(equity_cf) > 1:
            equity_cf[-1] += nwc

        sc_irr = calculate_irr(equity_cf)
        sc_npv = calculate_npv(financial_spec.discount_rate_equity, equity_cf)

        covenant_breach = sweep_triggered or default_alert
        details = "Default Breach: CFADS insufficient to cover senior debt service" if default_alert else (
            "Cash Sweep triggered: Debt service coverage compressed below 1.20x" if sweep_triggered else "Compliant"
        )

        results[key] = SensitivityScenario(
            name=sc_data["name"],
            ebitda=round(ebitda, 2),
            cfads=round(cfads_y, 2),
            min_dscr=round(min_dscr, 2),
            avg_dscr=round(avg_dscr, 2),
            equity_irr=sc_irr,
            project_npv=round(sc_npv, 2),
            cash_sweep_triggered=sweep_triggered,
            covenant_breach=covenant_breach,
            default_alert=default_alert,
            details=details,
        )

    return results


def optimize_chp_pe(
    pe_min: float = 200.0,
    pe_max: float = 1200.0,
    pe_step: float = 50.0,
    baseline_params: Optional[ChpProcessParams] = None,
    financial_spec: Optional[FinancialParametersSpec] = None
) -> ChpOptimizationResult:
    """
    Parametric electrical capacity scanner for CHP cogeneration systems.
    
    Identifies the optimal plateau (350–500 kW) where heat valorization is maximized,
    and forensically detects the -812 kW oversizing trap.
    """
    params = baseline_params if baseline_params is not None else ChpProcessParams()
    fin_spec = financial_spec if financial_spec is not None else FinancialParametersSpec()

    # Generate scan points ensuring 812 kW is evaluated
    scan_kw: List[float] = []
    cur = pe_min
    while cur <= pe_max + 1e-4:
        scan_kw.append(round(cur, 1))
        cur += pe_step

    if 812.0 not in scan_kw:
        scan_kw.append(812.0)
        scan_kw.sort()

    curve_points: List[ChpScanPoint] = []
    q_host_max = params.host_thermal_demand_kw
    eta_e = params.electrical_efficiency
    eta_th = params.thermal_efficiency
    pe_sat = q_host_max * (eta_e / eta_th)

    best_pe = 500.0
    best_irr = -1.0
    best_dscr = 0.0
    best_payback = 99.0
    trap_found = False
    trap_details_msg = None

    for pe in scan_kw:
        # Create CHP process spec for this capacity
        chp_p = params.copy(deep=True) if hasattr(params, "copy") else ChpProcessParams(**params.to_dict())
        chp_p.electrical_capacity_kw = pe

        scaled_fixed_capex = chp_p.capex_base_eur + chp_p.capex_per_kw * pe
        scaled_nwc = 75000.0 * (pe / 500.0)

        spec = IndustrialProcessSpec(
            process_type=IndustrialProcessType.CHP,
            name=f"CHP Cogeneration {pe} kW",
            fixed_capex=scaled_fixed_capex,
            nwc=scaled_nwc,
            chp_params=chp_p,
        )

        sim = simulate_project_finance(spec, fin_spec)

        q_th_gen = pe * (eta_th / eta_e)
        heat_val_pct = min(100.0, (min(q_th_gen, q_host_max) / q_th_gen) * 100.0) if q_th_gen > 0 else 100.0

        # Trap detection: electrical power exceeds host thermal absorption and causes covenant breach / severe IRR erosion
        is_trap = False
        pt_trap_msg = None
        if pe > pe_sat + 5.0 and (sim.summary.min_dscr < 1.10 or sim.summary.default_alert):
            is_trap = True
            trap_found = True
            pt_trap_msg = (
                f"La Trampa de los −{int(round(pe))} kW: El sobredimensionamiento sin demanda térmica "
                f"industrial satura la capacidad (Q_th = {q_th_gen:.1f} kWth vs demanda host {q_host_max:.1f} kWth), "
                f"disipa {max(0.0, q_th_gen - q_host_max):.1f} kWth sin valor comercial, degrada el EBITDA "
                f"y provoca un colapso del DSCR ({sim.summary.min_dscr:.2f}x) frente a una cuota de deuda anual de "
                f"{sim.summary.senior_debt_annual_payment:,.0f} €."
            )
            if abs(pe - 812.0) < 1.0:
                trap_details_msg = pt_trap_msg

        pt = ChpScanPoint(
            pe_kw=pe,
            ebitda=sim.summary.ebitda_base_year1,
            annual_cuota=sim.summary.senior_debt_annual_payment,
            dscr_avg=sim.summary.avg_dscr,
            dscr_min=sim.summary.min_dscr,
            equity_irr=sim.summary.equity_irr,
            payback_years=sim.summary.dynamic_payback_years,
            heat_valorized_pct=round(heat_val_pct, 1),
            trap=is_trap,
            trap_details=pt_trap_msg,
        )
        curve_points.append(pt)

        # Track bankable optimum (requires DSCR >= 1.20x)
        if sim.summary.min_dscr >= 1.20 and sim.summary.equity_irr is not None:
            if sim.summary.equity_irr > best_irr:
                best_irr = sim.summary.equity_irr
                best_pe = pe
                best_dscr = sim.summary.avg_dscr
                best_payback = sim.summary.dynamic_payback_years

    return ChpOptimizationResult(
        optimal_pe_kw=best_pe,
        optimal_equity_irr=round(best_irr, 4) if best_irr > 0 else None,
        optimal_avg_dscr=round(best_dscr, 2),
        optimal_payback_years=round(best_payback, 2) if best_payback is not None else None,
        scan_curve=curve_points,
        oversizing_trap_identified=trap_found,
        trap_details=trap_details_msg,
    )


__all__ = [
    "calculate_npv",
    "calculate_irr",
    "calculate_french_amortization",
    "calculate_dynamic_payback",
    "simulate_project_finance",
    "optimize_chp_pe",
]
