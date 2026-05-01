@echo off
echo =============================================
echo   VakilAI - Starting...
echo =============================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERROR: Node.js is not installed!
  echo Download from: https://nodejs.org
  pause
  exit /b 1
)

:: Start server in new window
echo Starting VakilAI Server...
start "VakilAI Server" cmd /k "cd /d %~dp0server && npm install --silent && node index.js"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start client in new window
echo Starting VakilAI Client...
start "VakilAI Client" cmd /k "cd /d %~dp0client && npm install --silent && npm run dev"

echo.
echo =============================================
echo   VakilAI is starting!
echo   Open: http://localhost:5173
echo =============================================
echo.
pause
