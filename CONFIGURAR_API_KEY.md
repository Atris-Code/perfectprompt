# 🔑 Guía: Configurar el proveedor de IA (OpenAI)

> **Actualizado (Fase 1).** La integración con Gemini fue reemplazada por un
> proxy backend `/api/ai` que custodia las claves **en el servidor**. El
> navegador ya NO expone ninguna clave de API.

## Dónde se configura

La clave vive **solo en el backend**, en el archivo `.env` (raíz del proyecto)
o en las variables de entorno del servidor (docker-compose, etc.):

```
# Proveedor primario
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Fallback opcional (texto/visión) — Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

# URL del backend para el frontend
VITE_NEXO_BACKEND_URL=http://localhost:8000
```

## Pasos

1. Obtén una clave en https://platform.openai.com/api-keys
2. Añádela a `.env` (junto al backend): `OPENAI_API_KEY=sk-...`
3. Reinicia el backend:
   ```powershell
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
4. Recarga la app (el frontend llama a `/api/ai/*` vía el proxy).

## Verificación

- Sin clave configurada, el proxy `/api/ai/*` responde **502**.
- Comprueba que la clave tenga saldo y permisos en el panel de OpenAI.

## Seguridad

- **Nunca** pongas la clave en el frontend ni en `vite.config.ts`.
- `.env` está en `.gitignore`.
- En producción, cierra el puerto `8000` al público (nginx ya proxifica `/api`).

## Troubleshooting

- **502 en `/api/ai`**: `OPENAI_API_KEY` ausente/vacía o sin saldo.
- **401**: falta el token JWT (`nexo_token`) — inicia sesión primero.
- Si falla OpenAI, el proxy intenta Claude como fallback (si `ANTHROPIC_API_KEY` está configurada).

---

**Última actualización:** migración a OpenAI (proxy `/api/ai`).
