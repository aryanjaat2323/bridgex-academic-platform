#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "============================================================"
echo " Starting BridgeX Academic SaaS Platform..."
echo "============================================================"

# Activate virtualenv and check database
cd "$DIR/backend"
source venv/bin/activate
python -m app.seed.seed_data

echo "[1/2] Starting FastAPI backend on http://localhost:8000 ..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "[2/2] Starting Vite React frontend on http://localhost:3000 ..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Stopping BridgeX services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo ""
echo "BridgeX is running!"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop all servers."
echo ""

wait
