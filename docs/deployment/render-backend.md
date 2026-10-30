# Deploying BridgeX Backend on Render

This guide covers deploying the FastAPI backend to [Render](https://render.com) (free tier available).

---

## Prerequisites

- A Render account
- A PostgreSQL database (Render managed DB, Supabase, or Neon)
- Your GitHub repository connected to Render

---

## Steps

### 1. Create a New Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo `aryanjaat2323/bridgex-academic-platform`
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `bridgex-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 2. Environment Variables

Set these in Render → Environment:

| Variable | Value |
|---|---|
| `SECRET_KEY` | A strong random 32+ character secret |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` |
| `ESCALATION_HOURS_THRESHOLD` | `48` |
| `UPLOAD_DIR` | `./uploads` |

### 3. Database Setup

- **Render PostgreSQL**: Create a managed PostgreSQL database and copy the Internal Database URL.
- **Supabase**: Use the connection string from Project Settings → Database → Connection string (URI mode).

The backend auto-creates tables and seeds data on first run.

### 4. CORS Configuration

After deploying, update `backend/app/main.py` CORS to your actual GitHub Pages URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aryanjaat2323.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Health Check

Render will call `GET /api/health` to verify the service is running.

---

## After Deployment

1. Copy your Render service URL (e.g., `https://bridgex-backend.onrender.com`)
2. Set `VITE_API_URL` in your frontend `.env.production` to this URL
3. Rebuild and redeploy the frontend
