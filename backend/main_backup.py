"""
Nexo Sinérgico - FastAPI Server
Main entry point for the Editorial Industrial Cognitiva backend.
"""
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
from typing import Dict, Any
# from prometheus_fastapi_instrumentator import Instrumentator
# from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time

from nexo_engine.config import settings
# from nexo_engine.models import NexoPayload, InsightCardResponse
# from nexo_engine.nexo_core import NexoSinergicoEngine

# Auth Imports
from database import get_db, engine, Base
from models import User
from schemas import LoginRequest, TokenResponse
from security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import get_current_user, require_role
from datetime import timedelta
from sqlalchemy.orm import Session


# Initialize FastAPI app
app = FastAPI(
    title="Nexo Sinérgico API",
    description="Editorial Industrial Cognitiva - Transform telemetry into multimedia content",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Prometheus instrumentation with custom configuration
# instrumentator = Instrumentator(
#     should_group_status_codes=False,
#     should_ignore_untemplated=False,
#     should_group_untemplated=False,
#     excluded_handlers=["/metrics"],
#     env_var_name="ENABLE_METRICS",
#     inprogress_name="nexo_inprogress_requests",
#     inprogress_labels=False,
# )
# instrumentator.instrument(app).expose(app, endpoint="/metrics")

# Initialize Nexo Engine
# nexo_engine = NexoSinergicoEngine()

# Custom Prometheus Metrics (avoiding conflicts with instrumentator)
# Temporarily disabled to fix startup issues
INSIGHT_GENERATION_COUNT = None
INSIGHT_GENERATION_LATENCY = None
FEEDBACK_COUNT = None
GEMINI_API_CALLS = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Nexo Sinérgico",
        "status": "online",
        "version": "1.0.0",
        "description": "Editorial Industrial Cognitiva"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",  # TODO: Add actual DB health check
        "gemini_api": "configured",
        "timestamp": "2024-01-01T00:00:00Z"
    }


# @app.post(
#     "/api/nexo/generate",
#     response_model=InsightCardResponse,
#     status_code=status.HTTP_200_OK,
#     summary="Generate Insight Card",
#     description="Process telemetry data and generate multimedia editorial content"
# )
# async def generate_insight(payload: NexoPayload) -> InsightCardResponse:
    """
    Main endpoint for generating InsightCard from industrial telemetry data.
    
    **Process:**
    1. Validates incoming payload
    2. Calculates business benchmarks
    3. Generates narrative text using Gemini
    4. Generates visual metaphor using Gemini Imagen
    5. Returns structured InsightCardResponse
    
    **Payload Example:**
    ```json
    {
        "timestamp": "2023-10-27T14:30:00Z",
        "source_module": "UTILITIES_V1",
        "data_context": {
            "inputs": {
                "demand_power_kw": 385,
                "electricity_rate_eur_kwh": 0.06
            },
            "calculated_results": {
                "hourly_cost_eur": 23.10,
                "annual_cost_eur": 184800.00
            }
        },
        "user_intent": {
            "action": "GENERATE_EXECUTIVE_REPORT",
            "target_audience": "CFO_INVESTORS",
            "tone": "ANALYTICAL_OPTIMISTIC"
        }
    }
    ```
    
    **Returns:** InsightCardResponse with visual asset, narrative, UI hints, and actions
    """
    start_time = time.time()
    source_module = payload.source_module
    action = payload.user_intent.action

    try:
        # Process the request through Nexo Engine
        response = await nexo_engine.process_request(payload)

        # Record successful generation
        generation_time = time.time() - start_time
        if INSIGHT_GENERATION_COUNT:
            INSIGHT_GENERATION_COUNT.labels(
                source_module=source_module,
                action=action,
                status='success'
            ).inc()
        if INSIGHT_GENERATION_LATENCY:
            INSIGHT_GENERATION_LATENCY.labels(
                source_module=source_module,
                action=action
            ).observe(generation_time)

        # TODO: Store in database (ai_generations table)
        # await db.insert_generation(response)

        return response

    except Exception as e:
        # Record failed generation
        if INSIGHT_GENERATION_COUNT:
            INSIGHT_GENERATION_COUNT.labels(
                source_module=source_module,
                action=action,
                status='error'
            ).inc()

        # Log the error
        print(f"Error generating insight: {str(e)}")

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "insight_generation_failed",
                "message": "Failed to generate insight card. Please try again.",
                "details": str(e) if settings.debug else None
            }
        )


@app.post("/api/nexo/feedback")
async def submit_feedback(feedback_data: Dict[str, Any]):
    """
    Submit user feedback for a generated insight.
    
    **Payload Example:**
    ```json
    {
        "generation_id": "uuid-here",
        "sentiment": 1,
        "tags": ["PERFECT", "PROFESSIONAL"],
        "user_comment": "Excellent visualization!",
        "action_taken": "ACCEPTED"
    }
    ```
    """
    try:
        sentiment = str(feedback_data.get("sentiment", "unknown"))

        # TODO: Store feedback in database (ai_feedback table)
        # await db.insert_feedback(feedback_data)

        # Record feedback submission
        if FEEDBACK_COUNT:
            FEEDBACK_COUNT.labels(sentiment=sentiment).inc()

        return {
            "status": "success",
            "message": "Feedback recorded. Thank you!"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "feedback_submission_failed", "message": str(e)}
        )


@app.post("/api/nexo/regenerate")
async def regenerate_insight(regeneration_data: Dict[str, Any]):
    """
    Regenerate an insight based on user feedback.
    
    **Payload Example:**
    ```json
    {
        "parent_generation_id": "uuid-here",
        "correction_instructions": "Make it less dark, more professional",
        "payload": { /* original NexoPayload */ }
    }
    ```
    """
    try:
        parent_id = regeneration_data.get("parent_generation_id")
        corrections = regeneration_data.get("correction_instructions", "")
        payload_data = regeneration_data.get("payload")
        
        if not payload_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing payload data"
            )
        
        # Parse payload
        payload = NexoPayload(**payload_data)
        
        # TODO: Modify prompt based on corrections
        # For now, just regenerate normally
        response = await nexo_engine.process_request(payload)
        
        # TODO: Store as child generation with parent_generation_id
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "regeneration_failed", "message": str(e)}
        )


# --- AUTH & SECURITY ENDPOINTS ---

@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login_for_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Official Login Endpoint.
    Verifies credentials and issues a JWS signed with the user's token version.
    """
    # 1. Find user by email
    user = db.query(User).filter(User.email == form_data.email).first()

    # 2. Security Validations
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not verify_password(form_data.password, user.password_hash):
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

    # 5. Response
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
    # require_role(current_user, "Operador") # Or Academico
    # Relaxed for demo user who is Academico
    require_role(current_user, "Academico")
    
    return {
        "user": current_user.email,
        "data": "Resultados de Pirólisis: Eficiencia 75%",
        "status": "Secure"
    }

@app.post("/creative/generate-prompt", tags=["Creative Studio"])
def generate_creative_prompt(current_user: User = Depends(get_current_user)):
    """
    Prompt Creator Route.
    """
    require_role(current_user, "Colaborador")

    return {
        "user": current_user.email,
        "prompt": "Genera una imagen futurista de una planta de biomasa...",
        "context_source": "Pyrolysis Hub Data"
    }

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


# Development server runner
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )
