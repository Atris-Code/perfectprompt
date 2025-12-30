# GitHub Copilot Instructions for PerfectPrompt (Nexo Sinérgico)

## 🏗 Project Architecture

This is a **hybrid AI full-stack application** ("Nexo Sinérgico") combining a React frontend with a FastAPI backend. Both layers interact with Google Gemini models, but for different purposes.

### Core Components

- **Frontend (`/frontend`)**: React + Vite application.
  - **Structure**: **FLAT directory structure**. There is **NO `src/` folder**. `App.tsx`, `index.tsx`, and `components/` sit directly in `/frontend`.
  - **Alias**: The `@` alias is configured to point to the `/frontend` root (e.g., `import { Button } from '@/components/Button'`).
  - **AI Logic**: 
    - **Interactive Chat**: Directly calls Gemini API via `services/geminiService.ts` (often using `gemini-2.5-pro` for speed).
    - **Complex Analysis**: Calls Backend API (e.g., `getKairosFinancialVerdict`).
  - **State**: Context API (`contexts/`).
  - **Styling**: Tailwind CSS.

- **Backend (`/backend`)**: Python FastAPI service.
  - **Role**: Orchestrates complex AI tasks, manages persistence (PostgreSQL), handles authentication, and exposes metrics (Prometheus).
  - **Core Engine**: `nexo_engine/` contains the business logic and AI orchestration (`nexo_core.py`).
  - **Database**: PostgreSQL managed via SQLAlchemy (`database.py`) and Pydantic models (`models.py`, `schemas.py`).
  - **AI Logic**: Uses `google.generativeai`. `gemini-1.5-pro` for deep reasoning (InsightCards) and `gemini-2.0-flash` for faster responses (`ai_service.py`).

- **Infrastructure**:
  - **Docker**: `docker-compose.yml` (dev) and `docker-compose.prod.yml` (prod).
  - **Monitoring**: Grafana & Prometheus stack (`/monitoring`).

## 🚀 Critical Workflows

### Development
- **Frontend**:
  - Run: `npm run dev` (in `/frontend`).
  - Config: `vite.config.ts`.
  - Env: `.env.local` (requires `VITE_GEMINI_API_KEY`).
- **Backend**:
  - Run: `python main.py` or `uvicorn main:app --reload` (in `/backend`).
  - Env: `.env` (requires `GEMINI_API_KEY`, `DATABASE_URL`).
- **Database**:
  - Init/Reset: `psql -f database/migrations/nexo_schema.sql`.
  - Connection: Defined in `backend/config.py` and `backend/database.py`.

### Testing
- **Integration Tests**: Standalone Python scripts in the root directory (e.g., `test_login.py`, `test_bridge.py`).
  - These often require the backend server to be running locally.
- **AI Verification**: `backend/test_genai.py` verifies Gemini API connectivity.

### Deployment
- **Production Build**:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d --build
  ```
- **Database Init (Prod)**:
  ```bash
  docker exec -it nexo_backend_prod python init_db.py
  ```

## 🧩 Project Patterns & Conventions

### Frontend (React/Vite)
- **Imports**: 
  - **CRITICAL**: Do not assume `src/` exists. Use relative paths or `@/` alias.
  - **Types**: Centralized in `types.ts`. Be extremely careful with **circular dependencies** here.
- **AI Service (`geminiService.ts`)**:
  - Contains both direct Gemini calls and calls to the backend API.
  - Use `import.meta.env.VITE_NEXO_BACKEND_URL` for backend requests.

### Backend (FastAPI)
- **Nexo Engine (`nexo_engine/`)**:
  - `NexoSinergicoEngine` class in `nexo_core.py` is the main entry point for AI logic.
  - Separates "Visual Metaphor" logic (`semantic_translator.py`) from core reasoning.
- **Async/Await**: heavily used for both DB and AI operations.
- **Metrics**: `prometheus_fastapi_instrumentator` is used in `main.py` to expose metrics at `/metrics`.

## ⚠️ Common Pitfalls
1.  **Frontend Imports**: Auto-imports often fail due to the flat structure. Always verify paths relative to `/frontend`.
2.  **Environment Variables**:
    - Frontend: `VITE_GEMINI_API_KEY`
    - Backend: `GEMINI_API_KEY`
3.  **Docker Networking**: In `docker-compose`, services are addressed by service name (e.g., `nexo_db`), but locally they are `localhost`.
4.  **Type Definitions**: `types.ts` is large. specific types like `FinalOptimizationPackage` or `SimulationResult` are critical for the "Kairos" module.
5.  **Gemini Models**: Frontend uses `gemini-2.5-pro` (experimental) and Backend uses `gemini-1.5-pro` + `gemini-2.0-flash`.

## 🔍 Key Files
- **AI Orchestration**: `backend/nexo_engine/nexo_core.py`
- **Frontend AI Service**: `frontend/services/geminiService.ts`
- **Database Schema**: `database/migrations/nexo_schema.sql`
- **Deployment Guide**: `DEPLOY_INSTRUCTIONS.md`
