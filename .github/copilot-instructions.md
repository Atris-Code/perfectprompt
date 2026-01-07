# GitHub Copilot Instructions for PerfectPrompt (Nexo Sinérgico)

## 🏗 Project Architecture

Hybrid AI full-stack application ("Nexo Sinérgico") combining React (Frontend) and FastAPI (Backend).

### Core Components

- **Frontend (`/frontend`)**: React + Vite.
  - **Structure**: **FLAT directory structure**. **NO `src/` folder**. `App.tsx` is at `/frontend/App.tsx`.
  - **Imports**: Use `@/` alias pointing to `/frontend` (e.g., `import { Button } from '@/components/Button'`).
  - **AI Logic**: 
    - **Direct**: `services/geminiService.ts` uses `gemini-2.5-pro` for interactive chat and JSON extraction.
    - **Via Backend**: Calls `getKairosFinancialVerdict` for complex auditing.
  - **State**: Context API (`contexts/`).
  - **Global Types**: `types.ts` (Centralized types). `AIStudio` and `pdfjsLib` are global.

- **Backend (`/backend`)**: Python FastAPI.
  - **Role**: Orchestration, Persistence (PostgreSQL), Auth, Metrics.
  - **Engine**: `nexo_engine/nexo_core.py` orchestrates AI flows.
  - **AI Logic**: `ai_service.py` uses:
    - `gemini-1.5-pro`: For "Kairos" (Auditor) complex reasoning.
    - `gemini-2.0-flash`: For general fast responses.
  - **Database**: PostgreSQL + SQLAlchemy (`database.py`).

- **Infrastructure**:
  - **Docker**: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod).
  - **Monitoring**: Prometheus (:9090) + Grafana (:3002).

## 🚀 Critical Workflows

### Development
- **Frontend**: `npm run dev` (in `/frontend`). Env: `.env.local` (`VITE_GEMINI_API_KEY`).
- **Backend**: `python main.py` or `uvicorn main:app --reload` (in `/backend`). Env: `.env` (`GEMINI_API_KEY`, `DATABASE_URL`).
- **Database**: Init with `psql -f database/migrations/nexo_schema.sql`.

### AI Workflows
- **Kairos Verdict**: 
  1. Frontend `getKairosFinancialVerdict` -> Backend `/api/nexo/kairos_verdict`.
  2. Backend `ai_service.generate_kairos_verdict` calls `gemini-1.5-pro` with specific persona.
- **Milestone Extraction**:
  1. Frontend `extractStrategicMilestones` calls `gemini-2.5-pro` with JSON schema enforcement.

### Monitoring
- **Start**: `start-monitoring.bat` (Windows) or `./start-monitoring.sh` (Linux/Mac).
- **Metrics**: Backend exposes `/metrics` for Prometheus.

## 🧩 Project Patterns & Conventions

### Frontend (React/Vite)
- **No `src/`**: Always import relative to `/frontend` or use `@/`.
- **Global Types**: Check `types.ts` before creating new interfaces.
- **Environment**: Use `import.meta.env.VITE_NEXO_BACKEND_URL` for API calls.

### Backend (FastAPI)
- **Async/Await**: Mandatory for DB and AI calls.
- **Pydantic**: Use `schemas.py` for request/response validation.
- **Gemini SDK**: `google.generativeai` is configured in `nexo_engine/nexo_core.py` and `ai_service.py`.

## ⚠️ Common Pitfalls
1.  **Import Paths**: Auto-imports often fail due to the flat structure. **Always verify paths**.
2.  **Model Confusion**: 
    - Frontend = `gemini-2.5-pro` (Speed/Interactive).
    - Backend = `gemini-1.5-pro` (Reasoning/Kairos) & `gemini-2.0-flash` (General).
3.  **Docker Networking**: Services are `localhost` on host, but service names (e.g., `nexo_db`) inside Docker network.
4.  **Type Circularity**: `types.ts` is large. Be careful with circular dependencies when adding new types.

## 🔍 Key Files
- **AI Orchestration**: `backend/nexo_engine/nexo_core.py`
- **Frontend AI Service**: `frontend/services/geminiService.ts`
- **Backend AI Service**: `backend/ai_service.py`
- **Global Types**: `frontend/types.ts`
- **Database Schema**: `database/migrations/nexo_schema.sql`
