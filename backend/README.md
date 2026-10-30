# BridgeX — Backend

FastAPI backend for the BridgeX academic doubt management platform.

## Quick Start

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env      # Edit SECRET_KEY
python -m app.seed.seed_data
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # Route handlers (auth, doubts, office_hours, ...)
│   ├── core/            # Config, database engine, JWT security
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic v2 request/response schemas
│   ├── services/        # Business logic (escalation, similarity, booking)
│   ├── seed/            # Database seed data
│   └── main.py          # FastAPI application entry point
├── tests/               # Pytest test suite
├── .env.example         # Environment variable template
└── requirements.txt
```

## Running Tests

```bash
pytest -v
```

## Production Start Command

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
