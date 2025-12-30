import os
import google.generativeai as genai
from dotenv import load_dotenv
from schemas import ContextPayload
from nexo_brain import get_system_prompt
from config import settings

load_dotenv()

# Configure Gemini
api_key = settings.GEMINI_API_KEY
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

def generate_nexo_response(context: ContextPayload, user_prompt: str) -> str:
    """
    Generates a response from Nexo (Gemini) based on the technical context and the user's request.
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        system_instruction = get_system_prompt()
        
        # Construct the full prompt
        full_prompt = f"""
{system_instruction}

--- CONTEXTO TÉCNICO (ContextTransferObject) ---
{context.model_dump_json(indent=2)}

--- SOLICITUD DEL USUARIO ---
{user_prompt}
"""
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "Lo siento, hubo un error al procesar tu solicitud con el motor de IA. Por favor verifica tu conexión o intenta más tarde."

def generate_kairos_verdict(user_query: str, yield_bio_oil: float, avg_irr: float, profitability: float) -> str:
    """
    Generates a financial verdict from Kairos (Auditor Persona).
    """
    try:
        # Using 1.5-pro for complex reasoning/auditing as per architecture
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        system_instruction = "Eres Kairos, el Auditor de STO. Eres un experto financiero y de riesgos. Respondes con análisis cuantitativos, directos y basados en datos. Tu veredicto es instantáneo y se basa en la simulación que has ejecutado internamente."
        
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
        
        # Note: gemini-1.5-pro doesn't support system_instruction in the same way as 2.5 in all SDK versions, 
        # but we can prepend it or use the config if supported. 
        # For safety in this specific codebase context, we'll prepend it to the prompt or use the system_instruction arg if valid.
        # The previous code used 'gemini-2.0-flash' without system_instruction arg in generate_content, 
        # but geminiService.ts used it in config.
        # Let's try passing it in the generation config or just prepending.
        
        full_prompt = f"{system_instruction}\n\n{prompt}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Error generating Kairos verdict: {e}")
        return "Error: Kairos no pudo completar la auditoría."
