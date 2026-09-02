# GitHub Copilot Instructions for PerfectPrompt (Nexo Sinérgico)

## 🏗 Project Architecture

Hybrid AI full-stack application ("Nexo Sinérgico") combining React (Frontend) and FastAPI (Backend).

### Core Components

- **Frontend (`/frontend`)**: React + Vite.
  - **Structure**: **FLAT directory structure**. **NO `src/` folder**. `App.tsx` sits directly in `/frontend`.
  - **Imports**: Use `@/` alias pointing to `/frontend` (e.g., `import { Button } from '@/components/Button'`).
  - **State**: Context API (`contexts/`).
  - **Global Types**: `types.ts` (Centralized types). `AIStudio` and `pdfjsLib` are global.
  - **AI Service**: `services/geminiService.ts` (Direct calls).

- **Backend (`/backend`)**: Python FastAPI.
  - **Role**: Orchestration, Persistence (PostgreSQL), Auth, Metrics.
  - **Engine**: `nexo_engine/nexo_core.py` (AI Orchestrator).
  - **AI Service**: `ai_service.py` (Indirect calls).
  - **Database**: PostgreSQL + SQLAlchemy (`database.py`).

- **Infrastructure**:
  - **Docker**: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod).
  - **Monitoring**: Prometheus (:9090) + Grafana (:3002).

## 🚀 Critical Workflows

### Development
- **Frontend**: `cd frontend` -> `npm run dev`. Env: `.env.local` (`VITE_GEMINI_API_KEY`).
  - *Note*: No test runner configured. Manual UI testing required.
- **Backend**: `cd backend` -> `python main.py`. Env: `.env` (`GEMINI_API_KEY`, `DATABASE_URL`).
- **Database**: Init with `psql -f database/migrations/nexo_schema.sql`.

### AI Models & Usage
- **Frontend Model**: `gemini-2.5-pro` (via `@google/genai`) for interactive chat and JSON extraction.
- **Backend Models**: 
  - `gemini-1.5-pro` for "Kairos" (Auditor) complex reasoning.
  - `gemini-2.0-flash` for general queries.

### Monitoring
- **Start**: `start-monitoring.bat` (Windows) or `./start-monitoring.sh` (Linux/Mac).
- **Dashboard**: Grafana at port 3002.

## 🧩 Patterns & Guidelines

### Frontend (React)
- **Files**: All source files in `/frontend`. No `src/`.
- **Types**: Always check `frontend/types.ts` first. Avoid inline types for domain objects.
- **Components**: Functional components, Tailwind-like styling.

### Backend (FastAPI)
- **Validation**: Strict `pydantic` schemas in `schemas.py`.
- **Async**: Use `async def` for all route handlers and DB operations.
- **Deps**: Use `Depends(get_db)` for DB sessions.

## ⚠️ Do's and Don'ts

1.  **DO NOT create a `src/` folder**. It breaks the build and import aliases.
2.  **DO NOT mix AI models**. Frontend = 2.5-Pro, Backend = 1.5-Pro / 2.0-Flash.
3.  **DO check `types.ts`**. It is the source of truth for `InsightCard`, `Milestone`, etc.
4.  **DO use absolute imports**. `@/` is preferred over `../../`.

## 🔍 Key Files
- **Orchestrator**: `backend/nexo_engine/nexo_core.py`
- **Frontend AI**: `frontend/services/geminiService.ts`
- **Backend AI**: `backend/ai_service.py`
- **Types**: `frontend/types.ts`
- **DB Migrations**: `database/migrations/nexo_schema.sql`
