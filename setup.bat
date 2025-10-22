@echo off
echo ================================================
echo   Website Project Planner - Setup
echo ================================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Minimum version required: 16.x or higher
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check npm
echo [2/4] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo npm usually comes with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

REM Install dependencies
echo [3/4] Installing dependencies...
echo This may take a few minutes...
echo.

call npm run install:all
if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo ERROR: Failed to install dependencies!
    echo ================================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Try running: npm cache clean --force
    echo 3. Delete node_modules folders and try again
    echo.
    echo If you get errors about 'better-sqlite3':
    echo - This is normal on Windows
    echo - The package includes prebuilt binaries
    echo - If it fails, you may need Windows Build Tools
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to build frontend!
    echo Check the error messages above for details.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Setup completed successfully!
echo ================================================
echo.
echo Next steps:
echo.
echo   1. Start the application:
echo      - Double-click: start-dev.bat
echo      - Or run: npm run dev
echo.
echo   2. Open your browser:
echo      - Frontend: http://localhost:5173
echo      - Backend API: http://localhost:3000
echo.
echo   3. Create your first project and start planning!
echo.
echo ================================================
echo.
pause
