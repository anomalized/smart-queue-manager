#!/usr/bin/env pwsh
<#
stop_demo.ps1

Stops processes started by run_demo.ps1 and cleans up PID files.

Usage:
  ./stop_demo.ps1
#>

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

$demoDir = Join-Path $root '.demo'
if (-not (Test-Path (Join-Path $demoDir 'pids.json'))) {
  Write-Output 'No .demo/pids.json found. Nothing to stop (or run_demo.ps1 not used).' ; Pop-Location ; return
}

$pids = Get-Content (Join-Path $demoDir 'pids.json') | ConvertFrom-Json
if ($pids.backend) {
  try { Stop-Process -Id $pids.backend -Force -ErrorAction Stop; Write-Output "Stopped backend PID $($pids.backend)" } catch { Write-Output "Could not stop backend PID $($pids.backend): $($_.Exception.Message)" }
}
if ($pids.frontend) {
  try { Stop-Process -Id $pids.frontend -Force -ErrorAction Stop; Write-Output "Stopped frontend PID $($pids.frontend)" } catch { Write-Output "Could not stop frontend PID $($pids.frontend): $($_.Exception.Message)" }
}

# Remove pid file
Remove-Item (Join-Path $demoDir 'pids.json') -ErrorAction SilentlyContinue
Write-Output 'Stopped demo processes and removed .demo/pids.json'

Pop-Location
