@echo off
REM One-click stop for Windows users
cd /d %~dp0
docker-compose down
pause
