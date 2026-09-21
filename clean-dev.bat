@echo off
rem ---------------------------------------------------------------
rem  Clears the stale Next.js build cache, then starts the dev server.
rem  CLOSE any running dev-server window before you run this, or the
rem  .next folder will still be locked.
rem ---------------------------------------------------------------
cd /d "%~dp0"

echo Removing the .next build cache...
if exist ".next" rmdir /s /q ".next"

if exist ".next" (
  echo.
  echo Could not remove .next -- a dev server is probably still running.
  echo Close that window, then run this file again.
  echo.
  pause
  exit /b 1
)

echo Cache cleared. Starting the dev server ^(first build takes a minute^)...
echo.
echo When it says "Ready", open http://localhost:3000
echo Press Ctrl+C twice in this window to stop it.
echo.
call npm run dev
echo.
echo The dev server has stopped.
pause
