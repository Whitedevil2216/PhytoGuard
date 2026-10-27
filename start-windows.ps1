# ==============================================================================
# PhytoGuard — Windows PowerShell Multi-Service Development Launcher
# Launches FastAPI (8000), Express API (5000), and React Vite Client (5173)
# Each service can also be started manually in separate PowerShell tabs.
# ==============================================================================

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting PhytoGuard Services from $RootDir ..." -ForegroundColor Green

# 1. Start Python FastAPI CNN Inference Service (Port 8000)
$MlCmd = "Set-Location '$RootDir\ml-service'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $MlCmd

# 2. Start Express + MongoDB Backend API (Port 5000)
$ServerCmd = "Set-Location '$RootDir\server'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $ServerCmd

# 3. Start React + Vite Frontend (Port 5173)
$ClientCmd = "Set-Location '$RootDir\client'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $ClientCmd

Write-Host "Launched 3 service windows:" -ForegroundColor Cyan
Write-Host "  - React Frontend  : http://localhost:5173"
Write-Host "  - Express Backend : http://localhost:5000/api/health"
Write-Host "  - FastAPI CNN API : http://127.0.0.1:8000/health"
