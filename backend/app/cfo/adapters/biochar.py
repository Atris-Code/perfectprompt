"""
Biochar / Pyrolysis Industrial Process Adapter.

Models slow pyrolysis conversion of biomass into high-purity biochar
and Puro.earth / EBC Carbon Dioxide Removal Certificates (CORCs):
- Dry/moist biomass intake balance.
- Temperature yield curve at reference 350°C.
- Oxygen leakage combustion penalty.
- Physical biochar sales revenue.
- CORC carbon credit monetization.
"""

from typing import Any, Dict, Optional, Tuple
from app.cfo.adapters.base import IIndustrialProcessAdapter
from app.cfo.specs import BiocharProcessParams, IndustrialProcessSpec


class BiocharAdapter(IIndustrialProcessAdapter):
    """Adapter for Biomass Slow Pyrolysis and CORC Carbon Credits."""

    def __init__(self) -> None:
        self.default_params = BiocharProcessParams()

    def _get_params(self, spec: IndustrialProcessSpec) -> BiocharProcessParams:
        return spec.biochar_params if spec.biochar_params is not None else self.default_params

    def compute_mass_energy_balance(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        
        # Operational days and total feedstock intake
        op_days = params.operating_days_year
        m_intake_annual = params.feedstock_input_t_day * op_days

        # Dry matter throughput (at reference 10% moisture, nominal dry biomass is 8,250 t/yr)
        if abs(params.feedstock_moisture_pct - 10.0) < 1e-6:
            m_dry_annual = m_intake_annual
        else:
            m_dry_annual = m_intake_annual * (1.0 - params.feedstock_moisture_pct / 100.0) / 0.90

        # Temperature yield curve: Y(T) = Y_base - alpha * (T - 350)
        # At reference 350°C, baseline dry yield is 34.0%
        t_ref = 350.0
        y_base = 0.34
        alpha_t = 0.00035  # yield reduction per °C increase
        temp_yield = max(0.15, min(0.50, y_base - alpha_t * (params.pyrolysis_temp_c - t_ref)))

        # Oxygen leakage combustion penalty: lambda_O2 = 1.5
        o2_leak_frac = params.oxygen_leak_pct / 100.0
        leak_penalty_factor = max(0.0, 1.0 - 1.5 * o2_leak_frac)

        # Net biochar yield & annual production
        effective_yield = temp_yield * leak_penalty_factor
        annual_biochar_tons = m_dry_annual * effective_yield

        # Carbon credits (CORCs)
        annual_corcs_tco2e = annual_biochar_tons * params.corc_yield_tco2e_per_ton_char

        # Parasitic electricity consumption
        aux_elec_mwh = (m_intake_annual * params.aux_electricity_kwh_ton) / 1000.0

        return {
            "annual_feedstock_intake_t": round(m_intake_annual, 2),
            "annual_dry_biomass_t": round(m_dry_annual, 2),
            "pyrolysis_temp_c": params.pyrolysis_temp_c,
            "pyrolysis_mass_yield_pct": round(effective_yield * 100.0, 2),
            "annual_biochar_production_t": round(annual_biochar_tons, 2),
            "annual_corcs_generated_tco2e": round(annual_corcs_tco2e, 2),
            "auxiliary_electricity_mwh": round(aux_elec_mwh, 2),
        }

    def compute_capex_opex(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        fixed_capex = spec.fixed_capex if spec.fixed_capex > 0 else 3200000.0
        nwc = spec.nwc if spec.nwc >= 0 else 150000.0
        total_investment = fixed_capex + nwc

        return {
            "fixed_capex": fixed_capex,
            "nwc": nwc,
            "total_initial_investment": total_investment,
            "fixed_om_annual": spec.fixed_om_eur_year,
            "variable_om_pct": spec.variable_om_pct_revenue,
        }

    def compute_revenue_opex(
        self,
        spec: IndustrialProcessSpec,
        scenario_shock: Optional[Dict[str, float]] = None
    ) -> Tuple[float, float, Dict[str, Any]]:
        params = self._get_params(spec)
        shocks = scenario_shock or {}

        # Apply availability shock
        avail_delta = shocks.get("availability_delta", 0.0)
        op_days = max(100, min(365, int(round(params.operating_days_year * (1.0 + avail_delta)))))

        # Annual feedstock intake under shock
        m_intake_annual = params.feedstock_input_t_day * op_days
        if abs(params.feedstock_moisture_pct - 10.0) < 1e-6:
            m_dry_annual = m_intake_annual
        else:
            m_dry_annual = m_intake_annual * (1.0 - params.feedstock_moisture_pct / 100.0) / 0.90

        # Biochar yield calculation
        t_ref = 350.0
        y_base = 0.34
        alpha_t = 0.00035
        temp_yield = max(0.15, min(0.50, y_base - alpha_t * (params.pyrolysis_temp_c - t_ref)))
        o2_leak_frac = params.oxygen_leak_pct / 100.0
        effective_yield = temp_yield * max(0.0, 1.0 - 1.5 * o2_leak_frac)
        annual_biochar_tons = m_dry_annual * effective_yield
        annual_corcs_tco2e = annual_biochar_tons * params.corc_yield_tco2e_per_ton_char

        # Price shocks
        char_price_delta = shocks.get("price_char_delta", shocks.get("char_price_delta", 0.0))
        corc_price_delta = shocks.get("price_corc_delta", shocks.get("corc_price_delta", 0.0))
        char_price = params.char_sale_price_eur_ton * (1.0 + char_price_delta)
        corc_price = params.corc_price_eur_tco2e * (1.0 + corc_price_delta)

        biochar_revenue = annual_biochar_tons * char_price
        corc_revenue = annual_corcs_tco2e * corc_price
        gross_revenue = biochar_revenue + corc_revenue

        # Feedstock cost shock
        feedstock_cost_delta = shocks.get("cost_feedstock_delta", shocks.get("feedstock_cost_delta", 0.0))
        feedstock_unit_cost = params.feedstock_cost_eur_ton * (1.0 + feedstock_cost_delta)
        annual_feedstock_cost = m_intake_annual * feedstock_unit_cost

        # Auxiliary electricity
        aux_elec_mwh = (m_intake_annual * params.aux_electricity_kwh_ton) / 1000.0
        annual_elec_cost = aux_elec_mwh * params.grid_electricity_eur_mwh

        # Dynamic OPEX calculation
        # 1. Base fixed O&M (labor, insurance, certifications, general overhead)
        if spec.fixed_om_eur_year > 0:
            base_fixed_om = spec.fixed_om_eur_year
        else:
            base_fixed_om = params.fixed_om_eur_year if params.fixed_om_eur_year is not None else 702912.50

        # General OPEX inflation / stress shock
        opex_cost_delta = shocks.get("cost_opex_delta", 0.0)

        # 2. Variable O&M linked to gross revenue
        var_om_pct = spec.variable_om_pct_revenue if spec.variable_om_pct_revenue is not None else (
            params.variable_om_pct_revenue if params.variable_om_pct_revenue is not None else 0.0
        )
        var_om = var_om_pct * gross_revenue

        # 3. Total dynamic OPEX (escalates base operating costs by opex_cost_delta)
        base_direct_opex = annual_feedstock_cost + annual_elec_cost + base_fixed_om
        total_opex = base_direct_opex * (1.0 + opex_cost_delta) + var_om

        details = {
            "biochar_revenue": round(biochar_revenue, 2),
            "corc_revenue": round(corc_revenue, 2),
            "gross_revenue": round(gross_revenue, 2),
            "feedstock_cost": round(annual_feedstock_cost, 2),
            "electricity_cost": round(annual_elec_cost, 2),
            "total_opex": round(total_opex, 2),
            "annual_biochar_tons": round(annual_biochar_tons, 2),
            "annual_corcs_tco2e": round(annual_corcs_tco2e, 2),
        }

        return round(gross_revenue, 2), round(total_opex, 2), details
