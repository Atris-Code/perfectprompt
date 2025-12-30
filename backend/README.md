# Nexo Sinérgico Backend

Python FastAPI backend for the Editorial Industrial Cognitiva system.

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your credentials:
- `DATABASE_URL`: Your PostgreSQL connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CLOUDINARY_*`: Your Cloudinary credentials

## Database Setup

Run the SQL migration:
```bash
# If using psql command line:
psql -U your_user -d your_database -f ../database/migrations/nexo_schema.sql

# Or use your preferred database client (DBeaver, pgAdmin, etc.)
```

## Running the Server

Development mode (with auto-reload):
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing the API

Using curl:
```bash
curl -X POST http://localhost:8000/api/nexo/generate \
  -H "Content-Type: application/json" \
  -d @test_payload.json
```

Using the interactive docs:
1. Navigate to http://localhost:8000/docs
2. Click on "POST /api/nexo/generate"
3. Click "Try it out"
4. Paste sample payload
5. Click "Execute"

## API Endpoints

### `POST /api/nexo/generate`
Generate InsightCard from telemetry data

**Request Body:**
See `models.py` for complete `NexoPayload` schema

**Response:**
`InsightCardResponse` with visual asset, narrative, and UI hints

### `POST /api/nexo/feedback`
Submit user feedback for a generated insight

### `POST /api/nexo/regenerate`
Regenerate insight based on user corrections

## Architecture

```
backend/
├── main.py                     # FastAPI server entry point
├── nexo_engine/
│   ├── __init__.py
│   ├── config.py               # Settings management
│   ├── models.py               # Pydantic data models
│   ├── semantic_translator.py # VisualMetaphorEngine
│   ├── nexo_core.py            # NexoSinergicoEngine
│   └── database.py             # Database layer (TODO)
├── requirements.txt
├── .env.example
└── README.md
```

## Next Steps

1. Implement database layer (`database.py`)
2. Add Cloudinary integration for image storage
3. Implement Gemini Imagen API integration
4. Add unit tests
5. Add production deployment configuration

## Troubleshooting

**Error: "An API key must be set"**
- Check that `GEMINI_API_KEY` is set in `.env`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check that migration was applied

**CORS errors from frontend:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
