@echo off
echo ============================================
echo  AMICA — Startup Script
echo ============================================
echo.

echo [1/3] Starting PostgreSQL via Docker...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker failed to start PostgreSQL.
    echo Make sure Docker Desktop is running first!
    echo   - Open Docker Desktop manually
    echo   - Wait for the whale icon to turn green
    echo   - Then run this script again
    echo.
    pause
    exit /b 1
)

echo [2/3] Waiting for PostgreSQL to be healthy...
:wait_pg
docker compose ps --format "{{.Health}}" 2>nul | findstr /i "healthy" >nul
if %errorlevel% neq 0 (
    echo   Waiting...
    timeout /t 3 /nobreak >nul
    goto wait_pg
)
echo   PostgreSQL is healthy!

echo [3/3] Starting backend server...
echo.
cd backend\server
call ..\myenv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
