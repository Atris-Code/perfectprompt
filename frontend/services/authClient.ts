/**
 * authClient.ts — Cliente de autenticación central para Nexo Sinérgico.
 *
 * Centraliza la gestión del access token (JWT) y del refresh token:
 *  - login  → guarda ambos tokens
 *  - refresh → renueva el JWT con el refresh token (rotación)
 *  - logout → revoca el refresh token en el servidor y limpia el almacenamiento
 *  - authFetch → `fetch` con Bearer token y auto-renovación única ante un 401
 *
 * Uso:
 *   import { authFetch, logout } from '../services/authClient';
 *   const res = await authFetch('/api/algo', { method: 'POST', body: ... });
 */

const ACCESS_KEY = 'nexo_token';
const REFRESH_KEY = 'nexo_refresh_token';

export const BACKEND_URL: string =
  import.meta.env.VITE_NEXO_BACKEND_URL || '';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

/** Guarda el access token y, opcionalmente, el refresh token. */
export function setTokens(access: string, refresh?: string | null): void {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_KEY, refresh);
    } else if (refresh === null) {
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch {
    /* almacenamiento no disponible: ignorar */
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignorar */
  }
}

/** Renovación en vuelo para evitar múltiples `/auth/refresh` simultáneos. */
let refreshInFlight: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token ?? null);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Cierra la sesión: revoca el refresh token en el servidor y limpia lo local. */
export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      /* best-effort: aun sin respuesta del backend cerramos la sesión local */
    }
  }
  clearTokens();
}

/**
 * `fetch` con Bearer token y auto-renovación: ante un único 401 intenta
 * renovar el access token y reintenta la petición una sola vez.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const doFetch = (withToken: boolean): Promise<Response> => {
    const headers = new Headers(init.headers || {});
    if (withToken) {
      const token = getAccessToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  };

  let res = await doFetch(true);
  if (res.status === 401 && getRefreshToken()) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      res = await doFetch(true);
    }
  }
  return res;
}
