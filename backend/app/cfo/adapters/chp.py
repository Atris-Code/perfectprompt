"""
Combined Heat and Power (CHP) Cogeneration Industrial Process Adapter.

Models high-efficiency gas turbine / internal combustion engine cogeneration:
- Primary fuel thermal consumption and spark spread.
- Net electricity export.
- Thermal energy recovery with host baseload absorption constraint (Q_host, max).
- Dissipated heat (aerocooler losses) and parasitic cooling penalty.
- Fixed CAPEX scaling as a function of installed electric capacity (Pe).
- Forensic detection of "La Trampa de los −812 kW" (oversizing trap).
"""

from typing import Any, Dict, Optional, Tuple
from app.cfo.adapters.base import IIndustrialProcessAdapter
from app.cfo.specs import ChpProcessParams, IndustrialProcessSpec


class ChpAdapter(IIndustrialProcessAdapter):
    """Adapter for Cogeneration Combined Heat & Power (CHP)."""

    def __init__(self) -> None:
        self.default_params = ChpProcessParams()

    def _get_params(self, spec: IndustrialProcessSpec) -> ChpProcessParams:
        return spec.chp_params if spec.chp_params is not None else self.default_params

    def compute_mass_energy_balance(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        pe = params.electrical_capacity_kw
        hop = params.operating_hours_year
        eta_e = params.electrical_efficiency
        eta_th = params.thermal_efficiency
        q_host_max = params.host_thermal_demand_kw

        # Gross electricity generation (MWh_e)
        ee_gross_mwh = (pe * hop) / 1000.0

        # Fuel thermal consumption (MWh_fuel LHV)
        fuel_mwh = ee_gross_mwh / eta_e

        # Thermal power and total generated thermal energy (kW_th, MWh_th)
        q_th_gen = pe * (eta_th / eta_e)
        eth_gen_mwh = (q_th_gen * hop) / 1000.0

        # Clamping to host baseload absorption capacity
        q_th_valorized = min(q_th_gen, q_host_max)
        eth_valorized_mwh = (q_th_valorized * hop) / 1000.0

        # Dumped heat (wasted thermal output)
        q_dumped = max(0.0, q_th_gen - q_host_max)
        eth_dumped_mwh = (q_dumped * hop) / 1000.0
        heat_valorized_pct = (eth_valorized_mwh / eth_gen_mwh * 100.0) if eth_gen_mwh > 0 else 100.0

        # Parasitic electricity consumed by aerocoolers/chillers for dumped heat
        parasitic_cooling_kw = (q_dumped / 1000.0) * params.parasitic_cooling_kw_per_mw_dumped
        parasitic_mwh = (parasitic_cooling_kw * hop) / 1000.0
        ee_net_mwh = max(0.0, ee_gross_mwh - parasitic_mwh)

        # Thermal saturation electrical power threshold
        pe_thermal_cap = q_host_max * (eta_e / eta_th)

        return {
            "electrical_capacity_kw": pe,
            "annual_operating_hours": hop,
            "electrical_efficiency": eta_e,
            "thermal_efficiency": eta_th,
            "thermal_power_generated_kw": round(q_th_gen, 2),
            "thermal_power_valorized_kw": round(q_th_valorized, 2),
            "thermal_power_dumped_kw": round(q_dumped, 2),
            "annual_fuel_consumption_mwh": round(fuel_mwh, 2),
            "annual_gross_electricity_mwh": round(ee_gross_mwh, 2),
            "annual_parasitic_cooling_mwh": round(parasitic_mwh, 2),
            "annual_net_electricity_mwh": round(ee_net_mwh, 2),
            "annual_valorized_heat_mwh": round(eth_valorized_mwh, 2),
            "annual_dumped_heat_mwh": round(eth_dumped_mwh, 2),
            "heat_valorization_rate_pct": round(heat_valorized_pct, 2),
            "pe_thermal_saturation_limit_kw": round(pe_thermal_cap, 2),
            "is_oversized_beyond_thermal_host": pe > pe_thermal_cap + 1.0,
        }

    def compute_capex_opex(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        params = self._get_params(spec)
        pe = params.electrical_capacity_kw

        # Scaled CAPEX if spec.fixed_capex is default or not explicitly overridden
        if spec.fixed_capex > 0:
            fixed_capex = spec.fixed_capex
        else:
            fixed_capex = params.capex_base_eur + params.capex_per_kw * pe

        nwc = spec.nwc if spec.nwc >= 0 else 75000.0 * (pe / 500.0)
        total_investment = fixed_capex + nwc

        return {
            "pe_kw": pe,
            "fixed_capex": round(fixed_capex, 2),
            "nwc": round(nwc, 2),
            "total_initial_investment": round(total_investment, 2),
            "fixed_om_eur_year": spec.fixed_om_eur_year or params.fixed_om_eur_year,
            "variable_om_pct_revenue": spec.variable_om_pct_revenue,
        }

    def compute_revenue_opex(
        self,
        spec: IndustrialProcessSpec,
        scenario_shock: Optional[Dict[str, float]] = None
    ) -> Tuple[float, float, Dict[str, Any]]:
        params = self._get_params(spec)
        shocks = scenario_shock or {}

        # Operating hours shock
        avail_delta = shocks.get("availability_delta", 0.0)
        hop = max(1000, min(8760, int(round(params.operating_hours_year * (1.0 + avail_delta)))))

        pe = params.electrical_capacity_kw
        eta_e = params.electrical_efficiency
        eta_th = params.thermal_efficiency
        q_host_max = params.host_thermal_demand_kw

        # Energy quantities
        ee_gross_mwh = (pe * hop) / 1000.0
        fuel_mwh = ee_gross_mwh / eta_e

        q_th_gen = pe * (eta_th / eta_e)
        q_th_val = min(q_th_gen, q_host_max)
        eth_val_mwh = (q_th_val * hop) / 1000.0

        q_dumped = max(0.0, q_th_gen - q_host_max)
        parasitic_cooling_kw = (q_dumped / 1000.0) * params.parasitic_cooling_kw_per_mw_dumped
        parasitic_mwh = (parasitic_cooling_kw * hop) / 1000.0
        ee_net_mwh = max(0.0, ee_gross_mwh - parasitic_mwh)

        # Tariffs with scenario shocks
        elec_price_delta = shocks.get("price_electricity_delta", shocks.get("electricity_price_delta", 0.0))
        fuel_cost_delta = shocks.get("cost_fuel_delta", shocks.get("fuel_cost_delta", 0.0))
        heat_price_delta = shocks.get("price_heat_delta", shocks.get("heat_price_delta", 0.0))

        p_elec = params.electricity_sale_price_eur_mwh * (1.0 + elec_price_delta)
        p_fuel = params.fuel_cost_eur_mwh_lhv * (1.0 + fuel_cost_delta)
        p_heat = params.heat_sale_price_eur_mwh * (1.0 + heat_price_delta)

        # Revenue
        revenue_elec = ee_net_mwh * p_elec
        revenue_heat = eth_val_mwh * p_heat
        gross_revenue = revenue_elec + revenue_heat

        # Spark spread indicator (€/MWh_e net)
        spark_spread = p_elec - (p_fuel / eta_e)

        # Thermal boiler substitution: displaced natural gas in host boiler (90% efficiency)
        boiler_eff = 0.90
        displaced_fuel_mwh = eth_val_mwh / boiler_eff
        net_fuel_mwh = max(0.0, fuel_mwh - displaced_fuel_mwh)
        net_fuel_cost = net_fuel_mwh * p_fuel

        # O&M expenses
        fixed_om = spec.fixed_om_eur_year if spec.fixed_om_eur_year > 0 else params.fixed_om_eur_year
        var_om_rev = spec.variable_om_pct_revenue * gross_revenue
        # Specific variable O&M per MWh electric generated, connected directly to specification
        var_om_rate = params.variable_om_eur_mwh
        var_om_mwh = ee_gross_mwh * var_om_rate * (1.0 + fuel_cost_delta * 0.5)

        # Aerocooler parasitic electrical cost and heat dissipation handling surcharge
        eth_dumped_mwh = (q_dumped * hop) / 1000.0
        cooling_elec_cost = parasitic_mwh * p_elec
        # Heat dissipation and aerocooler penalty on unvalorized heat (~38 €/MWh_th dumped)
        dissipation_penalty = eth_dumped_mwh * 38.0

        total_opex = net_fuel_cost + fixed_om + var_om_rev + var_om_mwh + cooling_elec_cost + dissipation_penalty

        details = {
            "pe_kw": pe,
            "operating_hours": hop,
            "net_electricity_mwh": round(ee_net_mwh, 2),
            "valorized_heat_mwh": round(eth_val_mwh, 2),
            "dumped_heat_mwh": round(eth_dumped_mwh, 2),
            "revenue_electricity": round(revenue_elec, 2),
            "revenue_heat": round(revenue_heat, 2),
            "gross_revenue": round(gross_revenue, 2),
            "fuel_cost": round(net_fuel_cost, 2),
            "fixed_om_cost": round(fixed_om, 2),
            "var_om_cost": round(var_om_rev + var_om_mwh, 2),
            "cooling_cost": round(cooling_elec_cost + dissipation_penalty, 2),
            "total_opex": round(total_opex, 2),
            "spark_spread_eur_mwh": round(spark_spread, 2),
        }

        return round(gross_revenue, 2), round(total_opex, 2), details
