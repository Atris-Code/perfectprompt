import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ContentType } from '../types';
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
import type { FormData, ProFormData, Marker, AgentSolution, TextualNarrativeCoherence, ProLayout, GeoContextualData, VideoPreset, NarrativeConsistencyFeedback } from '../types';
import { ALL_VIDEO_PRESETS } from "../data/videoPresets";
import { CLASSIFIED_GENRE_PRESETS } from "../data/genrePresets";
import { ALL_DOCUMENTARY_PRESETS } from "../data/documentaryPresets";
import { ALL_STYLES } from "../data/styles";
import { SENSATION_CATEGORIES } from "../data/sensations";

// FIX: Commented out as this was causing "API key must be set" error in browser
// The GoogleGenAI instance is not used anywhere in this file (only generateLayoutPreview exists)
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: unknown, action: string): Error => {
  console.error(`Error durante la acción de "${action}":`, error);

  if (error instanceof SyntaxError) {
    // Este error es específico para cuando se espera un JSON y no se recibe.
    return new Error("La respuesta de la IA no es un JSON válido. Por favor, intenta de nuevo o ajusta tu solicitud.");
  }

  if (error instanceof Error) {
    const message = error.message;
    if (message.includes('API key not valid') || message.includes('API_KEY_INVALID') || message.includes('401')) {
      return new Error("Tu clave de API de Gemini no es válida o no tiene los permisos necesarios (Error 401).");
    }
    if (message.includes('429')) {
      return new Error(`Has excedido tu cuota de solicitudes para ${action} (Error 429). Por favor, espera un momento antes de intentarlo de nuevo.`);
    }
    if (message.includes('400')) {
      return new Error(`La solicitud para ${action} es incorrecta (Error 400). Esto puede deberse a contenido no permitido o a un formato inesperado.`);
    }
    if (message.includes('500') || message.includes('503')) {
      return new Error(`El servicio de IA está experimentando un problema temporal (Error 500 o 503). Por favor, inténtalo de nuevo más tarde.`);
    }
    if (message.toLowerCase().includes('fetch')) {
      return new Error(`Error de red durante la acción de "${action}". Por favor, comprueba tu conexión a internet e inténtalo de nuevo.`);
    }
  }

  return new Error(`No se pudo ${action}. Ocurrió un error inesperado.`);
};

export const generateLayoutPreview = (layout: ProLayout): { pml: string; previewContent: Record<string, string> } => {
  const pml = `
MASTER PROMPT FOR LAYOUT: ${layout.title}
RATIONALE: ${layout.rationale}
STRUCTURE:
${JSON.stringify(layout.structure, null, 2)}
---
Based on the layout structure above, generate placeholder content for the following blocks: image, data, fcn, prompt, title, video, history.
The content should be brief and descriptive of the block's purpose.
    `;

  const previewContent: Record<string, string> = {
    image: 'Placeholder for main image',
    data: 'Placeholder for data and specifications.',
    fcn: 'Placeholder for FCN feedback analysis.',
    prompt: 'Placeholder for the generated prompt code/text.',
    title: layout.title,
    video: 'Placeholder for video content.',
    history: 'Placeholder for generation history.',
  };

  return { pml, previewContent };
};
