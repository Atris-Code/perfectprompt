from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class Role(RoleBase):
    id: int
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: Optional[bool] = True

class User(UserBase):
    id: str
    token_version: int
    roles: List[Role] = []

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    roles: List[str]
    user_name: str

# --- NEXO SYNERGIC BRIDGE SCHEMAS ---

class SemanticBridge(BaseModel):
    primary_insight: str
    suggested_keywords: List[str]
    visual_cues: Dict[str, Any]  # Color, State, Elements

class ContextPayload(BaseModel):
    """
    El objeto oficial de transferencia entre Pyrolysis Hub y Prompt Creator
    """
    meta: Dict[str, str]
    project_identity: Dict[str, str]
    technical_core: Dict[str, Any] = Field(..., description="Datos duros de la simulación")
    semantic_bridge: SemanticBridge = Field(..., description="Interpretación narrativa de los datos")
    creative_defaults: Optional[Dict[str, str]] = None

class BridgeRequest(BaseModel):
    context: ContextPayload
    prompt: str

class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[str]
    target_id: Optional[str]
    action_type: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role_name: str
    action: str = Field(..., pattern="^(add|remove)$")

class MaterialBase(BaseModel):
    name: str
    type: str
    state: str = 'SOLID'
    properties: Dict[str, Any]

class Material(MaterialBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    mixture: List[Dict[str, Any]] # List of {id: str, percent: float}
    reactorType: str
    pyrolysisMode: str
    atmosphere: str
    residenceTime: float

class SimulationResult(BaseModel):
    yields: Dict[str, float] # oil, char, gas
    efficiency: float
    warnings: Optional[List[str]] = []
    analysis: Optional[str] = ""

class KairosRequest(BaseModel):
    user_query: str
    yield_bio_oil: float
    avg_irr: float
    profitability: float

class KairosResponse(BaseModel):
    verdict: str
    warnings: List[str]
    analysis: str

# --- ASSISTANT SCHEMAS ---

class AssistantBase(BaseModel):
    name: str
    role_prompt: str
    knowledge_source_type: str
    knowledge_source_content: Optional[str] = None
    owner_titan_id: str
    is_active: Optional[bool] = False

class AssistantCreate(AssistantBase):
    pass

class AssistantUpdate(BaseModel):
    name: Optional[str] = None
    role_prompt: Optional[str] = None
    knowledge_source_type: Optional[str] = None
    knowledge_source_content: Optional[str] = None
    is_active: Optional[bool] = None

class Assistant(AssistantBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

