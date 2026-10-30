# BridgeX — Backend

FastAPI backend for the BridgeX academic doubt management platform.

## Quick Start

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env      # Edit SECRET_KEY with a strong random value
python -m app.seed.seed_data
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health check: http://localhost:8000/api/health

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # Route handlers (auth, doubts, office_hours, analytics, admin…)
│   ├── core/            # Config, database engine, JWT security
│   ├── models/          # SQLAlchemy ORM models (12 tables)
│   ├── schemas/         # Pydantic v2 request/response schemas
│   ├── services/        # Business logic (escalation, similarity, booking, notifications)
│   ├── seed/            # Database seed data with demo accounts
│   └── main.py          # FastAPI application entry point
├── tests/               # Pytest test suite (4 modules)
├── uploads/             # Runtime file uploads (gitignored except .gitkeep)
├── .env.example         # Environment variable template — copy to .env
└── requirements.txt
```

## Running Tests

```bash
pytest -v
```

All 4 test modules must pass:
- `test_doubts` — Doubt creation, faculty routing, status transitions, audit timeline
- `test_duplicates` — Lexical similarity and academic stemming
- `test_escalation` — 48-hour SLA breach detection and admin alerts
- `test_office_hours` — Concurrency-safe booking and double-booking rejection

## Production Start Command

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables

See [`.env.example`](.env.example) for all required and optional variables.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing secret (32+ random chars) |
| `DATABASE_URL` | Prod | PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Prod | Comma-separated allowed CORS origins |
| `ESCALATION_HOURS_THRESHOLD` | No | Default: `48` |
