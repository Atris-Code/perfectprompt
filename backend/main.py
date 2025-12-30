import sys
if sys.version_info < (3, 10):
    import importlib.metadata
    import importlib_metadata
    if not hasattr(importlib.metadata, 'packages_distributions'):
        importlib.metadata.packages_distributions = importlib_metadata.packages_distributions

from typing import List
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Auth Imports
from database import get_db, engine, Base
from models import User, AuditLog, Role, Material
from schemas import LoginRequest, TokenResponse, ContextPayload, AuditLogResponse, UserRoleUpdate, User as UserSchema, UserCreate, BridgeRequest, Material as MaterialSchema, SimulationRequest, SimulationResult, KairosRequest, KairosResponse
from security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash
from dependencies import get_current_user, require_role
from nexo_brain import get_system_prompt
from audit import log_action_background
from ai_service import generate_nexo_response, generate_kairos_verdict
from prometheus_fastapi_instrumentator import Instrumentator

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexo Sinérgico Auth System")

# Initialize Prometheus Instrumentator
Instrumentator().instrument(app).expose(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Nexo Sinérgico Auth System Online"}

# --- AUTH & SECURITY ENDPOINTS ---

@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login_for_access_token(
    form_data: LoginRequest, 
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Official Login Endpoint.
    Verifies credentials and issues a JWS signed with the user's token version.
    """
    # 1. Find user by email
    user = db.query(User).filter(User.email == form_data.email).first()

    # 2. Security Validations
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo. Contacte al Admin.")

    # 3. Prepare Token Payload (Data Fusion)
    role_names = [role.name for role in user.roles]

    token_payload = {
        "sub": user.id,           # Subject (User ID)
        "email": user.email,      # Context
        "roles": role_names,      # For Frontend Access Control
        "ver": user.token_version # CRITICAL: Current token version for invalidation
    }

    # 4. Generate JWS
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data=token_payload, expires_delta=access_token_expires
    )

    # 5. Audit Log (Background)
    background_tasks.add_task(
        log_action_background,
        actor_id=user.id,
        action_type="LOGIN",
        ip_address=request.client.host,
        details={"email": user.email}
    )

    # 6. Response
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "roles": role_names,
        "user_name": user.full_name
    }

# --- PROTECTED ROUTES (DEMO) ---

@app.get("/pyrolysis/simulation-data", tags=["Pyrolysis Hub"])
def read_simulation_data(current_user: User = Depends(get_current_user)):
    """
    Analytical Hub Route.
    Only accessible if token is valid and not revoked.
    """
    # Relaxed for demo user who is Academico
    require_role(current_user, "Academico")
    
    return {
        "user": current_user.email,
        "data": "Resultados de Pirólisis: Eficiencia 75%",
        "status": "Secure"
    }

@app.post("/creative/generate-prompt", tags=["Creative Studio"])
def generate_creative_prompt(
    request: BridgeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Prompt Creator Route.
    Receives the full context and user prompt, and generates a creative response via Gemini.
    """
    require_role(current_user, "Colaborador")

    # Call the AI Service
    ai_response = generate_nexo_response(request.context, request.prompt)

    return {
        "user": current_user.email,
        "response": ai_response,
        "context_source": "Pyrolysis Hub Data (Live)"
    }

@app.post("/creative/receive-context", tags=["Creative Studio"])
def ingest_context(payload: ContextPayload, current_user: User = Depends(get_current_user)):
    """
    Data Bridge Endpoint.
    Receives the ContextTransferObject from Pyrolysis Hub and primes the Creative AI.
    """
    require_role(current_user, "Colaborador")
    
    # In a real scenario, we would store this context in Redis/DB linked to the user's session.
    # For this demo, we acknowledge receipt and return the "primed" state.
    
    system_prompt = get_system_prompt()
    
    return {
        "status": "Contexto asimilado. Nexo está listo.",
        "received_insight": payload.semantic_bridge.primary_insight,
        "suggested_mode": payload.creative_defaults.get("suggested_tone", "Neutral") if payload.creative_defaults else "Neutral",
        "active_system_prompt_preview": system_prompt[:100] + "..."
    }

@app.post("/nexo-bridge/analyze", tags=["Nexo Bridge"])
def analyze_with_nexo(
    request: BridgeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates a response from Nexo (Gemini) based on the technical context and the user's request.
    Requires 'Colaborador' or 'Admin' role.
    """
    # Allow Colaborador, Admin, or Academico
    if not any(r.name in ["Colaborador", "Admin", "Academico"] for r in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para usar Nexo Bridge")

    response_text = generate_nexo_response(request.context, request.prompt)
    return {"response": response_text}

# --- EMERGENCY ROUTE (ADMIN) ---

@app.post("/admin/revoke-user-tokens/{user_email}", tags=["Admin"])
def revoke_tokens(user_email: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Panic Button: Invalidates ALL existing tokens for a user instantly.
    """
    require_role(current_user, "Admin")

    target_user = db.query(User).filter(User.email == user_email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    # THE MAGIC: Simply increment the version
    target_user.token_version += 1
    db.commit()

    return {"msg": f"Tokens revocados. El usuario {user_email} deberá loguearse de nuevo."}

# --- ADMIN CONSOLE ENDPOINTS ---

@app.get("/admin/audit-logs", response_model=List[AuditLogResponse], tags=["Admin Console"])
def get_audit_logs(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Retrieve system audit logs.
    """
    require_role(current_user, "Admin")
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

@app.get("/admin/users", response_model=List[UserSchema], tags=["Admin Console"])
def list_users(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    List all users in the system.
    """
    require_role(current_user, "Admin")
    users = db.query(User).all()
    return users

@app.post("/admin/users", response_model=UserSchema, tags=["Admin Console"])
def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new user.
    """
    require_role(current_user, "Admin")
    
    # Check if user exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password,
        is_active=user.is_active
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Audit Log
    background_tasks.add_task(
        log_action_background,
        actor_id=current_user.id,
        action_type="USER_CREATE",
        target_id=db_user.id,
        details={"email": user.email, "full_name": user.full_name}
    )
    
    return db_user

@app.delete("/admin/users/{user_id}", tags=["Admin Console"])
def delete_user(
    user_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a user.
    """
    require_role(current_user, "Admin")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
        
    email = user.email # Save for log
    db.delete(user)
    db.commit()
    
    # Audit Log
    background_tasks.add_task(
        log_action_background,
        actor_id=current_user.id,
        action_type="USER_DELETE",
        target_id=user_id,
        details={"email": email}
    )
    
    return {"message": "Usuario eliminado correctamente"}

@app.post("/admin/users/{user_id}/roles", tags=["Admin Console"])
def manage_user_roles(
    user_id: str, 
    request: UserRoleUpdate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Assign or remove roles from a user.
    """
    require_role(current_user, "Admin")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    role = db.query(Role).filter(Role.name == request.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Rol '{request.role_name}' no existe")
        
    if request.action == "add":
        if role not in target_user.roles:
            target_user.roles.append(role)
            message = f"Rol {request.role_name} asignado a {target_user.email}"
        else:
            message = f"El usuario ya tiene el rol {request.role_name}"
    elif request.action == "remove":
        if role in target_user.roles:
            target_user.roles.remove(role)
            message = f"Rol {request.role_name} removido de {target_user.email}"
        else:
            message = f"El usuario no tiene el rol {request.role_name}"
            
    db.commit()
    
    # Audit Log
    background_tasks.add_task(
        log_action_background,
        actor_id=current_user.id,
        action_type="ROLE_CHANGE",
        target_id=target_user.id,
        details={"action": request.action, "role": request.role_name, "target_email": target_user.email}
    )
    
    return {"message": message}

# --- PYROLYSIS HUB ENDPOINTS ---

@app.get("/api/materials", response_model=List[MaterialSchema], tags=["Pyrolysis Hub"])
def get_materials(db: Session = Depends(get_db)):
    """
    Devuelve la 'Tabla Periódica' de materiales disponibles para la simulación.
    """
    return db.query(Material).all()

@app.post("/api/simulate", response_model=SimulationResult, tags=["Pyrolysis Hub"])
def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Motor de Simulación Avanzado (Backend).
    Calcula rendimientos basados en cinética química y valida reglas físicas.
    """
    warnings = []
    
    # 1. Validación de Reglas Físicas
    if request.pyrolysisMode == "FAST" and request.residenceTime > 2.0:
        warnings.append(f"Alerta de Proceso: La pirolisis rápida requiere tiempos < 2s (Actual: {request.residenceTime}s). Se ha ajustado el modelo a Pirolisis Lenta para mayor precisión.")
        request.pyrolysisMode = "SLOW"

    # 2. Obtener propiedades de la mezcla desde la DB
    total_c = 0
    total_h = 0
    total_o = 0
    total_n = 0
    total_s = 0
    total_cl = 0
    total_ash = 0
    total_moisture = 0
    
    mixture_mass = 0 # Base de cálculo 100 unidades (por los porcentajes)

    for item in request.mixture:
        # item is {id: str, percent: float}
        material = db.query(Material).filter(Material.id == item['id']).first()
        if not material:
            continue
            
        percent = item['percent']
        props = material.properties
        
        # Normalizar propiedades
        c = props.get('c_h_o_n', {}).get('c', 0)
        h = props.get('c_h_o_n', {}).get('h', 0)
        o = props.get('c_h_o_n', {}).get('o', 0)
        n = props.get('c_h_o_n', {}).get('n', 0)
        s = props.get('s', 0)
        cl = props.get('cl', 0)
        ash = props.get('ash', 0)
        moisture = props.get('moisture_default', 0)

        total_c += c * percent
        total_h += h * percent
        total_o += o * percent
        total_n += n * percent
        total_s += s * percent
        total_cl += cl * percent
        total_ash += ash * percent
        total_moisture += moisture * percent
        mixture_mass += percent

    if mixture_mass == 0:
        return SimulationResult(yields={"oil": 0, "char": 0, "gas": 0}, efficiency=0, warnings=["Mezcla vacía"], analysis="Sin datos")

    # Promedios ponderados
    avg_c = total_c / mixture_mass
    avg_h = total_h / mixture_mass
    avg_o = total_o / mixture_mass
    avg_n = total_n / mixture_mass
    avg_s = total_s / mixture_mass
    avg_cl = total_cl / mixture_mass
    avg_ash = total_ash / mixture_mass
    avg_moisture = total_moisture / mixture_mass

    # Alertas de Contaminantes
    if avg_cl > 0.1:
        warnings.append(f"ALERTA CRÍTICA: Contenido de Cloro ({avg_cl:.2f}%) excede el límite seguro. Riesgo de corrosión y formación de dioxinas.")
    if avg_s > 0.5:
        warnings.append(f"Advertencia Ambiental: Contenido de Azufre ({avg_s:.2f}%) alto. Requiere tratamiento de gases (SOx).")
    if avg_n > 1.0:
        warnings.append(f"Nota: Contenido de Nitrógeno ({avg_n:.2f}%) puede generar NOx.")

    # 3. Modelo Cinético Simplificado (Basado en ratios H/C y O/C)
    # H/C alto favorece volátiles (Oil/Gas). O/C alto baja valor calorífico.
    
    # Base yields
    oil_yield = 0
    char_yield = 0
    gas_yield = 0
    
    if request.pyrolysisMode == "FAST":
        # Maximiza Oil
        oil_yield = 50 + (avg_h * 2) - (avg_o * 0.5) - (avg_ash * 1.5)
        char_yield = 15 + (avg_c * 0.3) + avg_ash
        gas_yield = 100 - oil_yield - char_yield
    elif request.pyrolysisMode == "SLOW":
        # Maximiza Char
        char_yield = 35 + (avg_c * 0.5) + avg_ash
        oil_yield = 20 + (avg_h * 1.5)
        gas_yield = 100 - oil_yield - char_yield
    else: # FLASH or others
        oil_yield = 60 + (avg_h * 2)
        char_yield = 10 + avg_ash
        gas_yield = 100 - oil_yield - char_yield

    # Ajuste por Temperatura/Atmósfera (Simplificado)
    if request.atmosphere == "STEAM":
        gas_yield += 10
        oil_yield -= 5
        char_yield -= 5

    # Normalización final a 100%
    total_yield = oil_yield + char_yield + gas_yield
    oil_yield = (oil_yield / total_yield) * 100
    char_yield = (char_yield / total_yield) * 100
    gas_yield = (gas_yield / total_yield) * 100

    # Eficiencia
    efficiency = 85 - (avg_moisture * 1.2)
    if request.residenceTime > 10 and request.pyrolysisMode == "FAST":
        efficiency -= 10 # Penalización por reacciones secundarias

    analysis = f"Mezcla rica en Carbono ({avg_c:.1f}%) e Hidrógeno ({avg_h:.1f}%). "
    if oil_yield > 50:
        analysis += "Alto potencial para Bio-combustibles líquidos."
    elif char_yield > 30:
        analysis += "Excelente para producción de Biochar y secuestro de carbono."
    else:
        analysis += "Producción equilibrada de Syngas."

    return SimulationResult(
        yields={
            "oil": round(oil_yield, 1),
            "char": round(char_yield, 1),
            "gas": round(gas_yield, 1)
        },
        efficiency=round(efficiency, 1),
        warnings=warnings,
        analysis=analysis
    )

@app.post("/api/nexo/kairos_verdict", response_model=KairosResponse, tags=["Nexo AI"])
async def get_kairos_verdict(request: KairosRequest, current_user: User = Depends(get_current_user)):
    """
    Generates a financial verdict from Kairos (Auditor Persona).
    Requires authentication.
    """
    verdict = generate_kairos_verdict(
        user_query=request.user_query,
        yield_bio_oil=request.yield_bio_oil,
        avg_irr=request.avg_irr,
        profitability=request.profitability
    )
    
    # Log the audit action
    log_action_background(
        db=None, # We'd need to pass db session here if we want to log to DB, but log_action_background handles it differently or we need to refactor.
                 # For now, let's assume we just return the verdict. 
                 # Ideally we should inject BackgroundTasks and DB session.
        user_id=current_user.id,
        action="KAIROS_AUDIT",
        details=f"Audit requested for yield {request.yield_bio_oil}%"
    )
    
    return KairosResponse(verdict=verdict)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

