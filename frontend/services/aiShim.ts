/**
 * aiShim.ts — Adaptador de compatibilidad de la antigua API de compatibilidad.
 *
 * Replica la interfaz mínima de `@google/genai` que usan `nexoService.ts` y
 * varios componentes, redirigiendo TODAS las llamadas a la fachada `aiProvider`
 * (que a su vez pasa por el proxy backend `/api/ai`). La clave de API ya NO
 * vive en el navegador: el constructor ignora `apiKey`.
 */
import {
  generateText,
  generateJSON,
  generateImage,
  generateSpeech,
  describeImage,
  chat as aiChat,
} from './aiProvider';

// Constantes equivalentes a Type.* de @google/genai (valores de JSON Schema).
export const Type = {
  OBJECT: 'object',
  STRING: 'string',
  NUMBER: 'number',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
} as const;

export const Modality = {
  AUDIO: 'AUDIO',
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;

export interface Chat {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  sendMessage: (opts?: { message?: string } | string) => Promise<GenerateContentResponse>;
}

export interface GenerateContentResponse {
  text: string;
  candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType?: string } }> } }>;
  generatedImages?: Array<{ image?: { imageBytes?: string; mimeType?: string } }>;
}

export interface FunctionDeclaration {
  [key: string]: unknown;
}

function stripDataUri(s: string): string {
  const i = s.indexOf(',');
  return i >= 0 ? s.slice(i + 1) : s;
}

function extractTextFromContents(contents: unknown): string {
  if (typeof contents === 'string') return contents;
  if (Array.isArray(contents)) {
    return (contents as any[]).map((c) => (c?.parts as any[])?.map((p) => p?.text ?? '').join(' ') ?? '').join(' ');
  }
  const obj = contents as any;
  if (obj?.parts) return (obj.parts as any[]).map((p) => p?.text ?? '').join(' ');
  if (obj?.text) return obj.text;
  return '';
}

function extractImageFromContents(contents: unknown): { data: string; mimeType: string } | null {
  const parts: any[] = Array.isArray(contents)
    ? (contents as any[]).flatMap((c) => c?.parts ?? [])
    : ((contents as any)?.parts ?? []);
  for (const p of parts) {
    if (p?.inlineData) {
      return { data: stripDataUri(p.inlineData.data ?? ''), mimeType: p.inlineData.mimeType ?? 'image/png' };
    }
  }
  return null;
}

class NexoAI {
  constructor(_opts?: { apiKey?: string }) {
    // La clave ya no se usa en el cliente; las llamadas pasan por el backend.
  }

  models = {
    generateContent: async ({ contents, config }: any): Promise<GenerateContentResponse> => {
      const system: string = config?.systemInstruction ?? '';
      const prompt: string = extractTextFromContents(contents);
      const modalities: string[] = config?.responseModalities ?? [];
      const isAudio = modalities.includes('AUDIO');
      const image = extractImageFromContents(contents);
      const wantsJson = config?.responseMimeType === 'application/json';

      if (isAudio) {
        const audioDataUri = await generateSpeech(prompt, 'alloy');
        const base64 = stripDataUri(audioDataUri);
        return {
          text: '',
          candidates: [{ content: { parts: [{ inlineData: { data: base64, mimeType: 'audio/mpeg' } }] } }],
        };
      }

      if (image) {
        const desc = await describeImage(image.data, image.mimeType, prompt || 'Describe esta imagen en detalle.', system);
        return { text: desc };
      }

      if (wantsJson) {
        const obj = await generateJSON<unknown>(prompt, { system, schema: config?.responseSchema ?? undefined });
        return { text: JSON.stringify(obj) };
      }

      const text = await generateText(prompt, { system });
      return { text };
    },

    generateImages: async ({ prompt, config }: any): Promise<GenerateContentResponse> => {
      const size = config?.aspectRatio ? undefined : '1024x1024';
      const img = await generateImage(prompt, size);
      return { text: '', generatedImages: [{ image: { imageBytes: img, mimeType: 'image/png' } }] };
    },
  };

  chats = {
    create: ({ config }: any): Chat => {
      const system: string = config?.systemInstruction ?? '';
      const history: Array<{ role: string; content: string }> = [];
      return {
        messages: history,
        systemInstruction: system,
        sendMessage: async (opts?: { message?: string } | string): Promise<GenerateContentResponse> => {
          const text = typeof opts === 'string' ? opts : (opts?.message ?? '');
          history.push({ role: 'user', content: text });
          const reply = await aiChat(history, { system });
          history.push({ role: 'assistant', content: reply });
          return { text: reply };
        },
      };
    },
  };
}

export { NexoAI };
