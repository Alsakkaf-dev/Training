@echo off
title UTM Borrow - Stopping
echo  Stopping UTM Borrow...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq UTM Borrow*" >nul 2>&1
echo  Done. All stopped.
timeout /t 2 /nobreak >nul
exit
