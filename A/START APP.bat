@echo off
title UTM Borrow Launcher
echo Stopping old instances...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0backend && py -3.14 -m uvicorn server:app --reload"
timeout /t 3 /nobreak >nul
echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"
echo Done! Browser will open soon.
pause
