# BridgeX PowerShell Startup Script
$RootDir = $PSScriptRoot
$VenvPython = Join-Path $RootDir "backend\venv\Scripts\python.exe"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Starting BridgeX Academic SaaS Platform..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $VenvPython)) {
    Write-Host "Virtual environment not found. Setting up backend\venv..." -ForegroundColor Yellow
    $SystemPython = "$env:LOCALAPPDATA\Python\bin\python.exe"
    if (-not (Test-Path $SystemPython)) {
        $SystemPython = (Get-Command python -ErrorAction SilentlyContinue).Source
    }
    if (-not $SystemPython) {
        Write-Error "Python executable not found. Please install Python 3.10+."
        exit 1
    }
    & $SystemPython -m venv (Join-Path $RootDir "backend\venv")
    & $VenvPython -m pip install -r (Join-Path $RootDir "backend\requirements.txt")
}

Write-Host "[1/3] Checking and seeding database demo accounts..." -ForegroundColor Green
Set-Location (Join-Path $RootDir "backend")
& $VenvPython -m app.seed.seed_data

Write-Host "[2/3] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Green
$BackendProc = Start-Process -FilePath $VenvPython -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -PassThru

Write-Host "[3/3] Starting Vite React frontend on http://localhost:3000 ..." -ForegroundColor Green
Set-Location (Join-Path $RootDir "frontend")
$FrontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev -- --host 0.0.0.0 --port 3000" -PassThru

Write-Host ""
Write-Host "BridgeX is running!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "Health:   http://localhost:8000/api/health" -ForegroundColor White
Write-Host ""
