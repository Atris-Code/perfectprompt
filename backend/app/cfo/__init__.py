"""
Nexo Sinérgico CFO Project Finance SDD Module.

Provides institutional-grade financial decision modeling, capital structuring,
bankability covenant monitoring, and physical mass-energy balances for industrial assets.
"""

from app.cfo.adapters import (
    BiocharAdapter,
    ChpAdapter,
    IIndustrialProcessAdapter,
    get_adapter,
    register_adapter,
)
from app.cfo.core_engine import (
    calculate_dynamic_payback,
    calculate_french_amortization,
    calculate_irr,
    calculate_npv,
    optimize_chp_pe,
    simulate_project_finance,
)
from app.cfo.pydantic_compat import (
    PYDANTIC_V2,
    CfoBaseModel,
    dump_model,
    dump_model_json,
    parse_model,
)
from app.cfo.specs import (
    AnnualProjection,
    BiocharProcessParams,
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

__version__ = "1.0.0"

__all__ = [
    # Engine functions
    "simulate_project_finance",
    "optimize_chp_pe",
    "calculate_french_amortization",
    "calculate_irr",
    "calculate_npv",
    "calculate_dynamic_payback",
    # Spec models
    "IndustrialProcessType",
    "BiocharProcessParams",
    "ChpProcessParams",
    "IndustrialProcessSpec",
    "FinancialParametersSpec",
    "SimulationResult",
    "AnnualProjection",
    "SensitivityScenario",
    "SimulationSummary",
    "CovenantReport",
    "ChpScanPoint",
    "ChpOptimizationResult",
    # Adapters
    "get_adapter",
    "register_adapter",
    "IIndustrialProcessAdapter",
    "BiocharAdapter",
    "ChpAdapter",
    # Pydantic compat
    "PYDANTIC_V2",
    "CfoBaseModel",
    "dump_model",
    "dump_model_json",
    "parse_model",
]
