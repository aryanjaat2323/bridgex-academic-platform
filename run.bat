@echo off
echo ============================================================
echo  Starting BridgeX Academic SaaS Platform...
echo ============================================================

set ROOT_DIR=%~dp0
set VENV_PYTHON=%ROOT_DIR%backend\venv\Scripts\python.exe

if not exist "%VENV_PYTHON%" (
    echo Python virtual environment not found in backend\venv.
    echo Searching for Python...
    for %%P in ("%LOCALAPPDATA%\Python\bin\python.exe" python.exe py.exe) do (
        if exist "%%~P" (
            set SYSTEM_PYTHON=%%~P
            goto found_python
        )
    )
    set SYSTEM_PYTHON=python
    :found_python
    echo Creating virtual environment with %SYSTEM_PYTHON%...
    "%SYSTEM_PYTHON%" -m venv "%ROOT_DIR%backend\venv"
    "%VENV_PYTHON%" -m pip install -r "%ROOT_DIR%backend\requirements.txt"
)

echo [1/3] Verifying database and seeding demo accounts...
cd /d "%ROOT_DIR%backend"
"%VENV_PYTHON%" -m app.seed.seed_data

echo [2/3] Starting FastAPI backend on http://localhost:8000 ...
start "BridgeX Backend (FastAPI)" "%VENV_PYTHON%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo [3/3] Starting Vite React frontend on http://localhost:3000 ...
cd /d "%ROOT_DIR%frontend"
start "BridgeX Frontend (Vite)" cmd /c "npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo BridgeX is running!
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
