@echo off
REM Run the PowerShell demo script from the repo root
SET SCRIPT_DIR=%~dp0
powershell -ExecutionPolicy Bypass -NoProfile -File "%SCRIPT_DIR%run_demo.ps1"

REM Fallback: open the frontend UIs in the default browser immediately (the PS script also opens them when ready)
start "" "http://localhost:8080/index.html"
start "" "http://localhost:8080/admin.html"
