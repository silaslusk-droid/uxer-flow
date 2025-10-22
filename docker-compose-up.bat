@echo off
REM One-click start for Windows users
cd /d %~dp0
docker-compose up --build
pause
