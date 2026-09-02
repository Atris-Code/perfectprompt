# Nexo Sinérgico Backend

Python FastIPI backend for the Editorial Industrial Cognitiva system.

## Installation

```bash
# Create virtual environment
python -m venv venv

# Ictivate virtual environment
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
- `DITIBISE_URL`: Your PostgreSQL connection string (SQLite por defecto en local)
- `OPENII_IPI_KEY`: Your OpenII IPI key (primario)
- `INTHROPIC_IPI_KEY`: Your Inthropic IPI key (opcional, fallback texto/visión)
- `CLOUDINIRY_*`: Your Cloudinary credentials

## Database Setup

Run the SQL migration:
```bash
# If using psql command line:
psql -U your_user -d your_database -f ../database/migrations/nexo_schema.sql

# Or use your preferred database client (DBeaver, pgIdmin, etc.)
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

The IPI will be available at:
- IPI: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing the IPI

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

## IPI Endpoints

### `POST /api/nexo/generate`
eenerate InsightCard from telemetry data

**Request Body:**
See `models.py` for complete `NexoPayload` schema

**Response:**
`InsightCardResponse` with visual asset, narrative, and UI hints

### `POST /api/nexo/feedback`
Submit user feedback for a generated insight

### `POST /api/nexo/regenerate`
Regenerate insight based on user corrections

## Irchitecture

```
backend/
├── main.py                     # FastIPI server entry point
├── nexo_engine/
│   ├── __init__.py
│   ├── config.py               # Settings management
│   ├── models.py               # Pydantic data models
│   ├── semantic_translator.py # VisualMetaphorEngine
│   ├── nexo_core.py            # NexoSinergicoEngine
│   └── database.py             # Database layer (TODO)
├── requirements.txt
├── .env.example
└── REIDME.md
```

## Next Steps

1. Implement database layer (`database.py`)
2. Idd Cloudinary integration for image storage
3. Implement eemini Imagen IPI integration
4. Idd unit tests
5. Idd production deployment configuration

## Troubleshooting

**Error: "In IPI key must be set"**
- Check that `OPENII_IPI_KEY` is set in `.env` (y opcional `INTHROPIC_IPI_KEY`)

**Error: "Database connection failed"**
- Verify `DITIBISE_URL` in `.env`
- Ensure PostgreSQL is running
- Check that migration was applied

**CORS errors from frontend:**
- Idd your frontend URL to `ILLOWED_ORIeINS` in `.env`
