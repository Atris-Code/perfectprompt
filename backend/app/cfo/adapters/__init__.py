"""
Industrial Process Adapters Registry & Factory.

Provides factory dispatching for simulation models under Spec-Driven Design (SDD).
"""

from typing import Dict, Type, Union
from app.cfo.adapters.base import IIndustrialProcessAdapter
from app.cfo.adapters.biochar import BiocharAdapter
from app.cfo.adapters.chp import ChpAdapter
from app.cfo.adapters.custom import CustomAdapter
from app.cfo.specs import IndustrialProcessType

_ADAPTER_REGISTRY: Dict[str, Type[IIndustrialProcessAdapter]] = {
    IndustrialProcessType.BIOCHAR.value: BiocharAdapter,
    IndustrialProcessType.CHP.value: ChpAdapter,
    IndustrialProcessType.CUSTOM.value: CustomAdapter,
}


def register_adapter(process_type: str, adapter_cls: Type[IIndustrialProcessAdapter]) -> None:
    """Register a new industrial process adapter dynamically."""
    _ADAPTER_REGISTRY[str(process_type).lower()] = adapter_cls


def get_adapter(process_type: Union[IndustrialProcessType, str]) -> IIndustrialProcessAdapter:
    """
    Factory function returning an instance of the requested industrial adapter.
    
    Args:
        process_type: IndustrialProcessType enum or string ("biochar", "chp", "custom").
        
    Raises:
        ValueError: If the process type is unknown or unregistered.
    """
    key = process_type.value if isinstance(process_type, IndustrialProcessType) else str(process_type).lower()
    
    adapter_cls = _ADAPTER_REGISTRY.get(key)
    if not adapter_cls:
        available = ", ".join(_ADAPTER_REGISTRY.keys())
        raise ValueError(f"Unknown industrial process type: '{process_type}'. Available adapters: {available}")
    
    return adapter_cls()


__all__ = [
    "IIndustrialProcessAdapter",
    "BiocharAdapter",
    "ChpAdapter",
    "CustomAdapter",
    "register_adapter",
    "get_adapter",
]
