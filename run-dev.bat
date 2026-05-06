@echo off
setlocal
REM MuseAI: API on :8000, static site on :8080, then open browser.
REM Requires: py -3 (Windows Python launcher) or edit commands to "python" / "python3".

set "HERE=%~dp0"
if not exist "%HERE%index.html" (
  echo Run this from the repository root ^(index.html not found^).
  exit /b 1
)

echo MuseAI: API -^> http://127.0.0.1:8000  ^|  UI -^> http://127.0.0.1:8080
start "MuseAI API" cmd /k "cd /d "%HERE%backend" && py -3 -m uvicorn api:app --reload --host 127.0.0.1 --port 8000"
start "MuseAI Web" cmd /k "cd /d "%HERE%" && py -3 -m http.server 8080"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080"
endlocal
