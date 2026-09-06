"""
Router de IA para Nexo Sinérgico.

Expone un proxy HTTP que custodia las claves en el servidor:
  /api/ai/text   -> generación de texto
  /api/ai/json   -> JSON estructurado
  /api/ai/chat   -> chat multi-turno
  /api/ai/image  -> generación de imagen
  /api/ai/speech -> TTS
  /api/ai/vision -> análisis de imagen

Además, el endpoint de dominio /api/nexo/generate (insight de Phoenix).
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

import ai_provider
from dependencies import get_current_user
from models import User
from metrics import track_ai

router = APIRouter(prefix="/api/ai", tags=["AI Provider"])


class TextRequest(BaseModel):
    system: str = ""
    prompt: str = ""
    model: Optional[str] = None


class JSONRequest(BaseModel):
    system: str = ""
    prompt: str = ""
    json_schema: Optional[Dict[str, Any]] = None
    model: Optional[str] = None


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]] = Field(default_factory=list)
    system: str = ""
    model: Optional[str] = None


class ImageRequest(BaseModel):
    prompt: str = ""
    size: str = "1024x1024"


class SpeechRequest(BaseModel):
    text: str = ""
    voice: str = "alloy"


class VisionRequest(BaseModel):
    image_b64: str = ""
    mime_type: str = "image/png"
    prompt: str = ""
    system: str = ""


def _require_auth(current_user: User = Depends(get_current_user)) -> User:
    """Todos los endpoints del proxy requieren token válido."""
    return current_user


@router.post("/text")
@track_ai("text")
def ai_text(req: TextRequest, _: User = Depends(_require_auth)):
    try:
        return {"text": ai_provider.generate_text(req.system, req.prompt, req.model)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/json")
@track_ai("json")
def ai_json(req: JSONRequest, _: User = Depends(_require_auth)):
    try:
        return {"json": ai_provider.generate_json(req.system, req.prompt, req.json_schema, req.model)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/chat")
@track_ai("chat")
def ai_chat(req: ChatRequest, _: User = Depends(_require_auth)):
    try:
        return {"text": ai_provider.chat_completion(req.messages, req.system, req.model)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/image")
@track_ai("image")
def ai_image(req: ImageRequest, _: User = Depends(_require_auth)):
    try:
        return {"image": ai_provider.generate_image(req.prompt, req.size)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/speech")
@track_ai("speech")
def ai_speech(req: SpeechRequest, _: User = Depends(_require_auth)):
    try:
        return {"audio": ai_provider.generate_speech(req.text, req.voice)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/vision")
@track_ai("vision")
def ai_vision(req: VisionRequest, _: User = Depends(_require_auth)):
    try:
        return {"text": ai_provider.describe_image(req.image_b64, req.mime_type, req.prompt, req.system)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# --- Endpoint de dominio: insight de Phoenix (antes roto: /api/nexo/generate) ---

nexo_router = APIRouter(prefix="/api/nexo", tags=["Nexo AI"])


@nexo_router.post("/generate")
async def generate_nexo_insight(payload: Dict[str, Any], _: User = Depends(_require_auth)):
    """
    Genera una InsightCard para Phoenix a partir del contexto técnico.
    Sustituye al endpoint inexistente que Phoenix.tsx invocaba.
    """
    data_context = payload.get("data_context", {}) or {}
    user_intent = payload.get("user_intent", {}) or {}
    source_module = payload.get("source_module", "NEXO")

    inputs = data_context.get("inputs", {}) or {}
    results = data_context.get("calculated_results", {}) or {}

    prompt = f"""
Eres "Nexo", el puente entre el Ala Analítica y el Ala Creativa.
Genera una tarjeta de insight (InsightCard) a partir de este contexto técnico.

MÓDULO DE ORIGEN: {source_module}
INTENCIÓN DEL USUARIO: {user_intent}

ENTRADAS TÉCNICAS:
{inputs}

RESULTADOS CALCULADOS:
{results}

Devuelve un objeto JSON con EXACTAMENTE esta estructura:
{{
  "status": "completed",
  "generated_for_role": "TECHNICAL_INVESTORS",
  "visual_asset": {{
    "type": "prompt",
    "url": "",
    "alt_text": "Visualización generada por Nexo",
    "prompt_used": "Metáfora visual de la eficiencia del proceso",
    "aspect_ratio": "16:9"
  }},
  "narrative_content": {{
    "headline": "Titular breve y persuasivo",
    "sub_headline": "Subtítulo que resume el hallazgo",
    "body_markdown": "Análisis en markdown (3-5 puntos)",
    "call_to_action": "Acción sugerida",
    "highlighted_metrics": [
      {{"label": "Métrica 1", "value": "valor", "trend": "positive"}}
    ]
  }},
  "ui_hints": {{
    "theme_mode": "dark",
    "primary_color_hex": "#22d3ee",
    "secondary_color_hex": "#a78bfa",
    "card_border_style": "border border-cyan-500/30",
    "icon": "zap"
  }},
  "available_actions": [
    {{"id": "regenerate", "label": "Regenerar", "icon": "refresh"}},
    {{"id": "save", "label": "Guardar", "icon": "save"}}
  ]
}}

Los highlighted_metrics deben reflejar los valores reales de las entradas/resultados (2-4 métricas).
"""
    schema = {
        "type": "object",
        "properties": {
            "status": {"type": "string"},
            "generated_for_role": {"type": "string"},
            "visual_asset": {"type": "object"},
            "narrative_content": {"type": "object"},
            "ui_hints": {"type": "object"},
            "available_actions": {"type": "array"},
        },
    }

    try:
        data = ai_provider.generate_json(
            system="Eres Nexo, el orquestador del Nexo Sinérgico. Responde solo con JSON válido.",
            prompt=prompt,
            schema=schema,
        )
    except Exception:
        # Fallback determinista si la IA no está disponible
        data = {
            "status": "completed",
            "generated_for_role": "TECHNICAL_INVESTORS",
            "visual_asset": {
                "type": "prompt", "url": "",
                "alt_text": "Visualización generada por Nexo",
                "prompt_used": "Metáfora visual del proceso",
                "aspect_ratio": "16:9",
            },
            "narrative_content": {
                "headline": "Insight generado por Nexo",
                "sub_headline": "Resumen del contexto técnico",
                "body_markdown": f"**Módulo:** {source_module}\n\n- Entradas: {inputs}\n- Resultados: {results}",
                "call_to_action": "Revisar la configuración del proceso",
                "highlighted_metrics": [],
            },
            "ui_hints": {
                "theme_mode": "dark", "primary_color_hex": "#22d3ee",
                "secondary_color_hex": "#a78bfa", "card_border_style": "border border-cyan-500/30", "icon": "zap",
            },
            "available_actions": [
                {"id": "regenerate", "label": "Regenerar", "icon": "refresh"},
                {"id": "save", "label": "Guardar", "icon": "save"},
            ],
        }

    data["request_id"] = str(uuid.uuid4())
    data["timestamp"] = datetime.now(timezone.utc).isoformat()
    data.setdefault("status", "completed")
    data.setdefault("generated_for_role", "TECHNICAL_INVESTORS")
    data.setdefault("visual_asset", {})
    data.setdefault("narrative_content", {})
    data.setdefault("ui_hints", {})
    data.setdefault("available_actions", [])
    return data
