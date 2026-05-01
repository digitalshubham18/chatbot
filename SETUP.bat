@echo off
echo.
echo  ================================================
echo   LexAI Legal Advisor — Setup Script (Windows)
echo  ================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Please download and install it from: https://nodejs.org
    echo  Choose the LTS version. Then run this script again.
    pause
    exit /b 1
)
echo  [OK] Node.js found: 
node --version

:: Install server dependencies
echo.
echo  Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo  ERROR: Failed to install server dependencies.
    pause
    exit /b 1
)
echo  [OK] Server dependencies installed.
cd ..

:: Install client dependencies
echo.
echo  Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo  ERROR: Failed to install client dependencies.
    pause
    exit /b 1
)
echo  [OK] Client dependencies installed.
cd ..

echo.
echo  ================================================
echo   Setup Complete!
echo  ================================================
echo.
echo  NEXT STEP — Fill in your API keys:
echo.
echo  1. Open the file:  server\.env
echo  2. Replace PASTE_YOUR_MONGODB_URI_HERE  with your MongoDB URI
echo  3. Replace PASTE_YOUR_OPENROUTER_KEY_HERE  with your OpenRouter key
echo  4. Save the file
echo.
echo  Then run:  START.bat
echo.
pause
