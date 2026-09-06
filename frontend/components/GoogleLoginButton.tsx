import React, { useEffect, useRef, useState } from 'react';
import { setTokens, BACKEND_URL } from '../services/authClient';

interface GoogleLoginButtonProps {
  onLogin: (token: string) => void;
}

// Tipado mínimo del SDK Google Identity Services (cargado bajo demanda).
interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (resp: GoogleCredentialResponse) => void }) => void;
  prompt: () => void;
}

interface GoogleAccounts {
  id?: GoogleAccountsId;
}

declare global {
  interface Window {
    google?: { accounts?: GoogleAccounts };
  }
}

/**
 * Botón "Continuar con Google" (OAuth por ID token).
 *
 * Flujo:
 *  1. Carga el SDK Google Identity Services (gsi/client).
 *  2. `google.accounts.id.prompt()` obtiene un ID token (JWT) del usuario.
 *  3. El ID token se envía a `/auth/google` (backend verifica la firma con
 *     las claves públicas de Google y emite el JWT de Nexo + refresh token).
 *
 * Requiere VITE_GOOGLE_CLIENT_ID (client_id de Google Cloud Console).
 */
export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLogin }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  const handleCredential = async (response: GoogleCredentialResponse) => {
    const idToken = response?.credential;
    if (!idToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || 'Error al iniciar sesión con Google');
        return;
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token ?? null);
      onLogin(data.access_token);
    } catch {
      setError('Error de conexión al autenticar con Google');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId || initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts?.id?.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
    };
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleClick = () => {
    if (!clientId) {
      setError('Google OAuth no configurado (VITE_GOOGLE_CLIENT_ID)');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('SDK de Google aún no está disponible. Reintenta en un momento.');
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-900 text-slate-500">o continúa con</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-700 rounded-lg border border-slate-300 hover:bg-gray-50 font-medium text-sm disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.687 32.53 29.222 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        {loading ? 'Conectando…' : 'Continuar con Google'}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};
