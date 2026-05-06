# MuseAI: starts FastAPI on :8000 and static http.server on :8080, then opens the browser.
# Run from repo root:  .\run-dev.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
if (-not (Test-Path (Join-Path $backend "api.py"))) {
  Write-Error "api.py not found. Run this script from the repository root (same folder as index.html)."
  exit 1
}

$py = Get-Command py -ErrorAction SilentlyContinue
if (-not $py) {
  Get-Command python -ErrorAction Stop | Out-Null
}

Write-Host "MuseAI: API -> http://127.0.0.1:8000  |  UI -> http://127.0.0.1:8080" -ForegroundColor Cyan
Write-Host "Closing those windows stops the servers." -ForegroundColor DarkGray

if ($py) {
  Start-Process powershell -WorkingDirectory $backend -ArgumentList @(
    "-NoExit", "-Command", "py -3 -m uvicorn api:app --reload --host 127.0.0.1 --port 8000"
  )
  Start-Process powershell -WorkingDirectory $root -ArgumentList @(
    "-NoExit", "-Command", "py -3 -m http.server 8080"
  )
} else {
  Start-Process powershell -WorkingDirectory $backend -ArgumentList @(
    "-NoExit", "-Command", "python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000"
  )
  Start-Process powershell -WorkingDirectory $root -ArgumentList @(
    "-NoExit", "-Command", "python -m http.server 8080"
  )
}

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8080"
