"""
Proveedor de IA unificado para Nexo Sinérgico.

- OpenAI como proveedor principal (texto, JSON, visión, imagen, TTS).
- Anthropic Claude como fallback (texto, JSON, visión).
- Las claves viven SOLO en el servidor (variables de entorno).

Las llamadas del navegador pasan por el proxy HTTP `/api/ai/*` de `ai_router.py`.
"""
import base64
import json
import logging
from typing import Any, Dict, List, Optional

from config import settings

logger = logging.getLogger(__name__)

_openai_client = None
_anthropic_client = None


def _get_openai():
    global _openai_client
    if _openai_client is None:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY no está configurada en el backend")
        from openai import OpenAI
        _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


def _get_anthropic():
    global _anthropic_client
    if _anthropic_client is None:
        if not settings.ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY no está configurada en el backend")
        import anthropic
        _anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _anthropic_client


def _extract_json(text: str) -> str:
    """Extrae el primer objeto JSON de una respuesta (quita fences markdown)."""
    if not text:
        return "{}"
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    return text


def _anthropic_text(response) -> str:
    parts = [b.text for b in response.content if getattr(b, "type", None) == "text"]
    return "".join(parts).strip()


def generate_text(system: str, prompt: str, model: Optional[str] = None) -> str:
    """Generación de texto libre. OpenAI primario, Claude fallback."""
    errors = []
    try:
        client = _get_openai()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        resp = client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        errors.append(f"OpenAI: {e}")

    try:
        client = _get_anthropic()
        resp = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=4096,
            system=system or "",
            messages=[{"role": "user", "content": prompt}],
        )
        return _anthropic_text(resp)
    except Exception as e:
        errors.append(f"Claude: {e}")

    raise RuntimeError("IA no disponible: " + "; ".join(errors))


def generate_json(
    system: str = "",
    prompt: str = "",
    schema: Optional[Dict[str, Any]] = None,
    model: Optional[str] = None,
) -> Any:
    """Generación de JSON estructurado.

    El schema se incluye como instrucción en el prompt (no se depende del
    modo estricto de ningún proveedor), lo que hace el resultado portátil
    entre OpenAI y Claude.
    """
    full_prompt = prompt
    if schema:
        full_prompt += (
            "\n\nResponde ÚNICAMENTE con un objeto JSON válido que cumpla este schema "
            "(sin markdown, sin comentarios, sin texto adicional):\n"
            + json.dumps(schema, ensure_ascii=False)
        )
    else:
        full_prompt += "\n\nResponde ÚNICAMENTE con un objeto JSON válido (sin markdown ni comentarios)."

    errors = []
    try:
        client = _get_openai()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": full_prompt})
        resp = client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        return json.loads(_extract_json(resp.choices[0].message.content or ""))
    except Exception as e:
        errors.append(f"OpenAI: {e}")

    try:
        client = _get_anthropic()
        resp = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=8192,
            system=system or "",
            messages=[{"role": "user", "content": full_prompt}],
        )
        return json.loads(_extract_json(_anthropic_text(resp)))
    except Exception as e:
        errors.append(f"Claude: {e}")

    raise RuntimeError("IA JSON no disponible: " + "; ".join(errors))


def chat_completion(
    messages: List[Dict[str, str]],
    system: str = "",
    model: Optional[str] = None,
) -> str:
    """Chat multi-turno. `messages` es una lista {role, content}."""
    client = _get_openai()
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.extend(messages)
    resp = client.chat.completions.create(
        model=model or settings.OPENAI_MODEL,
        messages=msgs,
        temperature=0.7,
    )
    return (resp.choices[0].message.content or "").strip()


def generate_image(prompt: str, size: str = "1024x1024") -> str:
    """Genera una imagen. Devuelve URL o data URI base64.

    FIX: se eliminó el fallback a 'dall-e-3' porque ese modelo ya no existe
    en el endpoint de imágenes (400). Se usa 'gpt-image-1' y los errores se
    propagan tal cual para diagnóstico claro.
    """
    client = _get_openai()
    resp = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size=size,
        n=1,
    )
    d = resp.data[0]
    if getattr(d, "b64_json", None):
        return "data:image/png;base64," + d.b64_json
    return d.url or ""


def generate_speech(text: str, voice: str = "alloy") -> str:
    """Genera audio TTS. Devuelve data URI base64 (audio/mpeg)."""
    client = _get_openai()
    try:
        resp = client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice=voice,
            input=text,
        )
    except Exception:
        resp = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text,
        )
    b64 = base64.b64encode(resp.content).decode("ascii")
    return "data:audio/mpeg;base64," + b64


def describe_image(
    image_b64: str,
    mime_type: str,
    prompt: str,
    system: str = "",
    model: Optional[str] = None,
) -> str:
    """Describe/analiza una imagen (input multimodal)."""
    client = _get_openai()
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}},
        ],
    })
    resp = client.chat.completions.create(
        model=model or settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.5,
    )
    return (resp.choices[0].message.content or "").strip()
