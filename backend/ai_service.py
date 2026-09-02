"""
Servicio de IA de Nexo Sinérgico.

Reescrito para usar el proveedor unificado (OpenAI primario, Claude fallback)
en lugar de la integración directa con el proveedor anterior. Las claves viven en el
servidor (ai_provider.py).
"""
import logging

from ai_provider import generate_text
from nexo_brain import get_system_prompt

logger = logging.getLogger(__name__)


def generate_nexo_response(context, user_prompt: str) -> str:
    """
    Genera una respuesta de Nexo (antes el proveedor de IA) a partir del contexto técnico
    y la solicitud del usuario.
    """
    try:
        system_instruction = get_system_prompt()

        full_prompt = f"""
{system_instruction}

--- CONTEXTO TÉCNICO (ContextTransferObject) ---
{context.model_dump_json(indent=2)}

--- SOLICITUD DEL USUARIO ---
{user_prompt}
"""
        return generate_text(system="", prompt=full_prompt)
    except Exception as e:
        logger.error(f"Error generando respuesta de Nexo: {e}")
        return "Lo siento, hubo un error al procesar tu solicitud con el motor de IA. Por favor verifica tu conexión o intenta más tarde."


def generate_kairos_verdict(user_query: str, yield_bio_oil: float, avg_irr: float, profitability: float) -> str:
    """
    Genera el veredicto financiero de Kairos (persona Auditor de STO).
    """
    try:
        system_instruction = (
            "Eres Kairos, el Auditor de STO. Eres un experto financiero y de riesgos. "
            "Respondes con análisis cuantitativos, directos y basados en datos. Tu veredicto "
            "es instantáneo y se basa en la simulación que has ejecutado internamente."
        )

        prompt = f"""
ROL: Kairos, Auditor Crítico (Auditor de STO).

PREGUNTA DEL MODERADOR:
"{user_query}"

DATOS TÉCNICOS RECIBIDOS (M3 - Hefesto):
- Rendimiento de Bio-Aceite optimizado: {yield_bio_oil:.1f}%

RESULTADOS DE MI SIMULACIÓN INTERNA DE RIESGOS (M5):
- Metodología: Simulación de Monte Carlo (5000 iteraciones) contra supuestos de mercado (incertidumbre de precios del 30% y OPEX de 1.5M€).
- TIR Promedio: {avg_irr:.1f}%
- Probabilidad de Rentabilidad (vs 12% Coste Capital): {profitability:.0f}%

INSTRUCCIONES PARA LA RESPUESTA:
1. Comienza EXACTAMENTE con: "Kairos reportándose como Oponente Crítico."
2. Resume que has recibido el paquete de Hefesto, tomado el yield optimizado, y lo has ejecutado a través de tu simulador M5 contra los supuestos de mercado.
3. Declara tu veredicto: "La optimización técnica es financieramente sólida."
4. Reporta los resultados numéricos EXACTOS de tu simulación (TIR Promedio y Probabilidad de Rentabilidad).
5. Valida el resultado comparando el TIR Promedio con el coste de capital del 12%.
6. Concluye con tu aprobación para ratificar la configuración como la nueva línea base.
7. El tono debe ser el de un auditor: factual, cuantitativo y decisivo.
"""
        return generate_text(system=system_instruction, prompt=prompt)
    except Exception as e:
        logger.error(f"Error generando veredicto de Kairos: {e}")
        return "Error: Kairos no pudo completar la auditoría."
