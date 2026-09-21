@echo off
rem Starts the GMS Technical Solutions dev server.
rem Double-click this file, then open http://localhost:3000
cd /d "%~dp0"
echo Starting the dev server in %cd%
echo.
echo When it says "Ready", open http://localhost:3000
echo Press Ctrl+C twice in this window to stop it.
echo.
call npm run dev
echo.
echo The dev server has stopped.
pause
