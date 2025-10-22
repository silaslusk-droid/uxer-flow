@echo off
echo Setting up Sitemap Generator...
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Make sure to install version 16 or higher.
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

echo npm version:
npm --version

echo.
echo Installing all dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the development environment:
echo   - Windows: Double-click start-dev.bat
echo   - Or run: npm run dev
echo.
echo To start production mode:
echo   - Run: npm start
echo.
echo The application will be available at:
echo   - Frontend: http://localhost:5173
echo   - Backend: http://localhost:3000
echo.
pause
