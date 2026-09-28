@echo off
setlocal
cd /d "%~dp0"
title CampusPilot
cls

echo CampusPilot
echo Website: http://localhost:5173
echo Press Ctrl+C to stop the services.
echo.

REM Reuse Ollama if it is already running.
set "OLLAMA_TASK="
set "SERVICE_NAMES=Backend,Frontend"

ollama list >nul 2>&1
if errorlevel 1 (
    set OLLAMA_TASK="ollama serve"
    set "SERVICE_NAMES=Backend,Frontend,Ollama"
)

call frontend\node_modules\.bin\concurrently.cmd ^
    --kill-others ^
    --names "%SERVICE_NAMES%" ^
    --prefix-colors "cyan,green,yellow" ^
    "backend\.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --log-level warning --no-access-log" ^
    "npm.cmd --prefix frontend run dev -- --port 5173 --strictPort --open --clearScreen false" ^
    %OLLAMA_TASK%

endlocal