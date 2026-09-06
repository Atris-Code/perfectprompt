"""
Abstract Base Class for Spec-Driven Design (SDD) Industrial Process Adapters.

Decouples physical mass/energy balances, conversion efficiencies, and equipment scaling
from Project Finance debt service waterfalls and covenant monitoring.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple
from app.cfo.specs import IndustrialProcessSpec


class IIndustrialProcessAdapter(ABC):
    """
    Abstract interface for industrial process adapters.
    Each adapter models the physical, thermodynamic, and operational characteristics
    of a specific technology (e.g. Pyrolysis Biochar, Cogeneration CHP).
    """

    @abstractmethod
    def compute_mass_energy_balance(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        """
        Compute physical mass throughputs, energy generation/consumption,
        and conversion yields.
        """
        pass

    @abstractmethod
    def compute_capex_opex(self, spec: IndustrialProcessSpec) -> Dict[str, Any]:
        """
        Compute baseline CAPEX, Net Working Capital (NWC), and OPEX components.
        """
        pass

    @abstractmethod
    def compute_revenue_opex(
        self,
        spec: IndustrialProcessSpec,
        scenario_shock: Optional[Dict[str, float]] = None
    ) -> Tuple[float, float, Dict[str, Any]]:
        """
        Compute annual gross revenue and annual OPEX under nominal or shocked conditions.
        
        Args:
            spec: Industrial process specification.
            scenario_shock: Optional dictionary with parameter shocks:
                - price_char_delta: relative delta (e.g. -0.25)
                - price_corc_delta: relative delta (e.g. -0.40)
                - cost_feedstock_delta: relative delta (e.g. +0.10)
                - price_electricity_delta: relative delta (e.g. -0.15)
                - cost_fuel_delta: relative delta (e.g. +0.15)
                - price_heat_delta: relative delta (e.g. -0.10)
                - availability_delta: relative delta on hours/days (e.g. -0.05)

        Returns:
            Tuple of (annual_revenue, annual_opex, detailed_breakdown_dict)
        """
        pass
