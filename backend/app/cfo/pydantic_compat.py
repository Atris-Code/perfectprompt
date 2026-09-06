"""
Pydantic Compatibility Layer for CFO Project Finance SDD Module.

Provides resilient interoperability between Pydantic v1.10.x and v2.x:
- Resilient model dumping (model_dump vs dict)
- Resilient JSON serialization (model_dump_json vs json)
- Resilient validation (model_validate vs parse_obj)
- Field and model validator decorators
"""

import sys
from typing import Any, Callable, Dict, Optional, Type, TypeVar

try:
    import pydantic
    _version_str = getattr(pydantic, "__version__", "1.10.0")
    PYDANTIC_V2 = _version_str.startswith("2.") or int(_version_str.split(".")[0]) >= 2
except Exception:
    PYDANTIC_V2 = False

if PYDANTIC_V2:
    from pydantic import BaseModel, Field, field_validator, model_validator
    
    class CfoBaseModel(BaseModel):
        """Base model with v1/v2 agnostic helper methods."""
        model_config = {"extra": "ignore", "populate_by_name": True}

        def to_dict(self, **kwargs: Any) -> Dict[str, Any]:
            return self.model_dump(**kwargs)

        def to_json(self, **kwargs: Any) -> str:
            return self.model_dump_json(**kwargs)
            
        @classmethod
        def from_data(cls: Type["T"], data: Any) -> "T":
            return cls.model_validate(data)

else:
    from pydantic import BaseModel, Field, validator as field_validator, root_validator as model_validator
    
    class CfoBaseModel(BaseModel):
        """Base model with v1/v2 agnostic helper methods."""
        class Config:
            extra = "ignore"
            allow_population_by_field_name = True

        def to_dict(self, **kwargs: Any) -> Dict[str, Any]:
            return self.dict(**kwargs)

        def to_json(self, **kwargs: Any) -> str:
            return self.json(**kwargs)

        @classmethod
        def from_data(cls: Type["T"], data: Any) -> "T":
            return cls.parse_obj(data)

T = TypeVar("T", bound=BaseModel)


def dump_model(model: BaseModel, **kwargs: Any) -> Dict[str, Any]:
    """Safely convert Pydantic model to dictionary across v1 and v2."""
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)
    return model.dict(**kwargs)


def dump_model_json(model: BaseModel, **kwargs: Any) -> str:
    """Safely convert Pydantic model to JSON string across v1 and v2."""
    if hasattr(model, "model_dump_json"):
        return model.model_dump_json(**kwargs)
    return model.json(**kwargs)


def parse_model(model_cls: Type[T], data: Any) -> T:
    """Safely instantiate/validate Pydantic model from dict/data across v1 and v2."""
    if hasattr(model_cls, "model_validate"):
        return model_cls.model_validate(data)
    elif hasattr(model_cls, "parse_obj"):
        return model_cls.parse_obj(data)
    return model_cls(**data)


__all__ = [
    "PYDANTIC_V2",
    "BaseModel",
    "Field",
    "field_validator",
    "model_validator",
    "CfoBaseModel",
    "dump_model",
    "dump_model_json",
    "parse_model",
]
