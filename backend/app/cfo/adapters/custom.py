"""
Custom / Generic Industrial Process Adapter.

Fallback adapter for custom or generic industrial processes where
CAPEX and OPEX are specified directly without thermodynamic modeling.
"""

from typing import Any, Dict, Optional, Tuple
from app.cfo.adapters.base import IIndustrialProcessAdapter
from app.cfo.specs import IndustrialProcessSpec


class CustomAdapter(IIndustrialProcessAdapter):
    """Generic adapter for custom industrial asset typologies."""

    def compute_mass_energy_balance(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        return {
            "name": spec.name,
            "fixed_capex": spec.fixed_capex,
            "nwc": spec.nwc,
        }

    def compute_capex_opex(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        fixed_capex = spec.fixed_capex if spec.fixed_capex > 0 else 1000000.0
        nwc = spec.nwc if spec.nwc >= 0 else 0.0
        return {
            "fixed_capex": fixed_capex,
            "nwc": nwc,
            "total_initial_investment": fixed_capex + nwc,
            "fixed_om_annual": spec.fixed_om_eur_year,
            "variable_om_pct": spec.variable_om_pct_revenue,
        }

    def compute_revenue_opex(
        self,
        spec: IndustrialProcessSpec,
        scenario_shock: Optional[Dict[str, float]] = None
    ) -> Tuple[float, float, Dict[str, Any]]:
        # For custom processes without explicit revenue, operational revenue and OPEX
        # reflect the declared spec OPEX structure
        revenue = 0.0
        opex = spec.fixed_om_eur_year
        return round(revenue, 2), round(opex, 2), {"revenue": revenue, "opex": opex}
