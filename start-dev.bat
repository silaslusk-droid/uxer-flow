@echo off
echo Starting Sitemap Generator Development Environment...
echo.

echo Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo Starting development servers...
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

call npm run dev
