"""
Waste-to-Energy Municipal Solid Waste (RSU) Industrial Process Adapter.

Models the valorization of municipal solid waste (RSU) with ISCC EU certification:
- Energy recovery from the LHV of pre-treated MSW.
- Revenue stack: gate fee + electricity + heat + Guarantees of Origin (GOs) + avoided CO2 credits.
- OPEX with a humidity penalty above the design threshold.
"""

from typing import Any, Dict, Optional, Tuple
from app.cfo.adapters.base import IIndustrialProcessAdapter
from app.cfo.specs import IndustrialProcessSpec, WteRsuProcessParams


class WteRsuAdapter(IIndustrialProcessAdapter):
    """Adapter for Waste-to-Energy municipal solid waste (RSU) valorization."""

    def __init__(self) -> None:
        self.default_params = WteRsuProcessParams()

    def _get_params(self, spec: IndustrialProcessSpec) -> WteRsuProcessParams:
        return spec.wte_rsu_params if spec.wte_rsu_params is not None else self.default_params

    def compute_mass_energy_balance(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        capacity_t = params.annual_capacity_t
        mass_kg = capacity_t * 1000.0
        useful_mwh = mass_kg * params.pci_base_mj_kg * params.conversion_efficiency / 3600.0
        elec_mwh = useful_mwh * params.electricity_share
        heat_mwh = useful_mwh * params.heat_share
        renewable_mwh = useful_mwh * params.biogenic_fraction
        co2_avoided_t = useful_mwh * params.co2_factor_tco2e_per_mwh * params.biogenic_fraction

        return {
            "annual_capacity_t": capacity_t,
            "annual_msw_mass_kg": round(mass_kg, 2),
            "useful_energy_mwh": round(useful_mwh, 2),
            "electricity_mwh": round(elec_mwh, 2),
            "heat_mwh": round(heat_mwh, 2),
            "renewable_mwh": round(renewable_mwh, 2),
            "co2_avoided_t": round(co2_avoided_t, 2),
        }

    def compute_capex_opex(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        derived_capex = params.capex_per_ton_year * params.annual_capacity_t * (1.0 - params.grant_fraction)
        fixed_capex = spec.fixed_capex if spec.fixed_capex > 0 else derived_capex
        nwc = spec.nwc if spec.nwc >= 0 else (params.annual_capacity_t * 3.0)

        return {
            "fixed_capex": round(fixed_capex, 2),
            "nwc": round(nwc, 2),
            "total_initial_investment": round(fixed_capex + nwc, 2),
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

        capacity_t = max(0.0, params.annual_capacity_t * (1.0 + shocks.get("availability_delta", 0.0)))
        mass_kg = capacity_t * 1000.0
        useful_mwh = mass_kg * params.pci_base_mj_kg * params.conversion_efficiency / 3600.0
        elec_mwh = useful_mwh * params.electricity_share
        heat_mwh = useful_mwh * params.heat_share
        renewable_mwh = useful_mwh * params.biogenic_fraction
        co2_avoided_t = useful_mwh * params.co2_factor_tco2e_per_mwh * params.biogenic_fraction

        p_gate = params.gate_fee_eur_ton * (1.0 + shocks.get("price_gate_fee_delta", 0.0))
        p_elec = params.electricity_price_eur_mwh * (1.0 + shocks.get("price_electricity_delta", 0.0))
        p_heat = params.heat_price_eur_mwh * (1.0 + shocks.get("price_heat_delta", 0.0))
        p_go = params.go_price_eur_mwh * (1.0 + shocks.get("price_go_delta", 0.0))
        p_carbon = params.carbon_price_eur_tco2e * (1.0 + shocks.get("price_carbon_delta", 0.0))

        revenue_gate_fee = capacity_t * p_gate
        revenue_elec = elec_mwh * p_elec
        revenue_heat = heat_mwh * p_heat
        revenue_go = renewable_mwh * p_go
        revenue_carbon = co2_avoided_t * p_carbon
        gross_revenue = revenue_gate_fee + revenue_elec + revenue_heat + revenue_go + revenue_carbon

        base_opex = capacity_t * params.opex_base_eur_ton
        humidity = params.actual_humidity + shocks.get("humidity_delta", 0.0)
        excess_pct = max(0.0, (humidity - params.design_humidity) * 100.0)
        humidity_penalty = capacity_t * excess_pct * params.opex_humidity_penalty_eur_ton_pct
        fixed_om = spec.fixed_om_eur_year if spec.fixed_om_eur_year > 0 else 0.0
        var_om = spec.variable_om_pct_revenue * gross_revenue
        total_opex = (base_opex + humidity_penalty + fixed_om) * (1.0 + shocks.get("cost_opex_delta", 0.0)) + var_om

        details = {
            "annual_capacity_t": round(capacity_t, 2),
            "useful_energy_mwh": round(useful_mwh, 2),
            "electricity_mwh": round(elec_mwh, 2),
            "heat_mwh": round(heat_mwh, 2),
            "renewable_mwh": round(renewable_mwh, 2),
            "co2_avoided_t": round(co2_avoided_t, 2),
            "revenue_gate_fee": round(revenue_gate_fee, 2),
            "revenue_electricity": round(revenue_elec, 2),
            "revenue_heat": round(revenue_heat, 2),
            "revenue_go": round(revenue_go, 2),
            "revenue_carbon": round(revenue_carbon, 2),
            "gross_revenue": round(gross_revenue, 2),
            "base_opex": round(base_opex, 2),
            "humidity_penalty": round(humidity_penalty, 2),
            "total_opex": round(total_opex, 2),
        }

        return round(gross_revenue, 2), round(total_opex, 2), details
