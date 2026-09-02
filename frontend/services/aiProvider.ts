/**
 * aiProvider.ts — Fachada única de IA para Nexo Sinérgico.
 *
 * Todas las llamadas de IA del navegador pasan por el proxy backend `/api/ai/*`,
 * que custodia las claves en el servidor. Esto reemplaza la integración directa
 * con `@google/genai` (que exponía la API key en el bundle del cliente).
 *
 * Uso:
 *   const texto = await generateText(prompt, { system: '...' });
 *   const json  = await generateJSON<MiTipo>(prompt, { schema: {...} });
 *   const img   = await generateImage(prompt);
 *   const audio = await generateSpeech(texto, voice);
 *   const desc  = await describeImage(base64, mimeType, prompt);
 */

export const BACKEND_URL: string =
  import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('nexo_token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI Provider error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Generación de texto libre. */
export async function generateText(
  prompt: string,
  options?: { system?: string; model?: string }
): Promise<string> {
  const data = await post<{ text: string }>('/api/ai/text', {
    prompt,
    system: options?.system ?? '',
    model: options?.model,
  });
  return data.text;
}

/** Generación de JSON estructurado (schema opcional, se incluye en el prompt). */
export async function generateJSON<T = unknown>(
  prompt: string,
  options?: { system?: string; schema?: object; model?: string }
): Promise<T> {
  const data = await post<{ json: T }>('/api/ai/json', {
    prompt,
    system: options?.system ?? '',
    json_schema: options?.schema,
    model: options?.model,
  });
  return data.json;
}

/** Chat multi-turno. `messages` es [{role, content}]. */
export async function chat(
  messages: Array<{ role: string; content: string }>,
  options?: { system?: string; model?: string }
): Promise<string> {
  const data = await post<{ text: string }>('/api/ai/chat', {
    messages,
    system: options?.system ?? '',
    model: options?.model,
  });
  return data.text;
}

/** Generación de imagen. Devuelve URL o data URI. */
export async function generateImage(prompt: string, size?: string): Promise<string> {
  const data = await post<{ image: string }>('/api/ai/image', {
    prompt,
    size: size ?? '1024x1024',
  });
  return data.image;
}

/** Texto-a-voz. Devuelve data URI (audio/mpeg). */
export async function generateSpeech(text: string, voice?: string): Promise<string> {
  const data = await post<{ audio: string }>('/api/ai/speech', {
    text,
    voice: voice ?? 'alloy',
  });
  return data.audio;
}

/** Análisis de imagen (multimodal). `imageBase64` sin prefijo `data:`. */
export async function describeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  system?: string
): Promise<string> {
  const data = await post<{ text: string }>('/api/ai/vision', {
    image_b64: imageBase64,
    mime_type: mimeType,
    prompt,
    system: system ?? '',
  });
  return data.text;
}
