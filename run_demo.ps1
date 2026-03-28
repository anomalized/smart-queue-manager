#!/usr/bin/env pwsh
<#
run_demo.ps1

Starts backend + frontend, opens the browser to the UIs, runs a short demo flow
and saves the demo state (queue id, token) under ./.demo for later reuse.

Usage (PowerShell):
  ./run_demo.ps1

Notes:
- Requires Node/npm on PATH and MongoDB running (or MONGODB_URI set in backend/.env).
- Uses npx http-server for frontend serving.
#>

Set-StrictMode -Version Latest
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

$demoDir = Join-Path $root '.demo'
If (-not (Test-Path $demoDir)) { New-Item -Path $demoDir -ItemType Directory | Out-Null }

Function Log($msg) { $t = Get-Date -Format o; "$t  $msg" | Out-File -FilePath (Join-Path $demoDir 'demo_log.txt') -Append; Write-Output $msg }

Log 'Starting demo: ensure backend deps are installed (if needed)'
If (-not (Test-Path (Join-Path $root 'backend\node_modules'))) {
  Log 'Installing backend npm deps...'
  npm install --prefix "$root\backend" | Out-Null
}

# Start backend
Log 'Starting backend (node backend/server.js)'
$backendProc = Start-Process -FilePath 'node' -ArgumentList 'backend\server.js' -PassThru
Start-Sleep -Milliseconds 400

# Start frontend static server using npx http-server
Log 'Starting frontend (npx http-server -p 8080)'
try {
  $frontendProc = Start-Process -FilePath 'npx' -ArgumentList 'http-server -p 8080' -PassThru
} catch {
  Log 'Failed to start frontend with npx; ensure npx is available.'
  throw
}

# Save PIDs
@{ backend = $backendProc.Id; frontend = $frontendProc.Id } | ConvertTo-Json | Out-File -FilePath (Join-Path $demoDir 'pids.json') -Encoding utf8
Log "Saved PIDs backend=$($backendProc.Id) frontend=$($frontendProc.Id)"

# Wait for backend and frontend to be ready
Function WaitForUrl($url, $timeoutSec=30) {
  $end = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $end) {
    try { $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { return $true } } catch { }
    Start-Sleep -Seconds 1
  }
  return $false
}

Log 'Waiting for backend http://localhost:4000/'
if (-not (WaitForUrl 'http://localhost:4000/' 30)) { Log 'WARNING: backend did not respond in time'; }
else { Log 'Backend ready' }

Log 'Waiting for frontend http://localhost:8080/index.html'
if (-not (WaitForUrl 'http://localhost:8080/index.html' 30)) { Log 'WARNING: frontend did not respond in time' } else { Log 'Frontend ready' }

# Open UIs in the default browser
Log 'Opening browser to frontend UIs'
Start-Process 'http://localhost:8080/index.html'
Start-Process 'http://localhost:8080/admin.html'

# Run sample demo flow: create queue, request token, call next
Log 'Running sample demo flow (create queue, get token, call next, end)'
try {
  $headers = @{ Authorization = 'Bearer admin123'; 'Content-Type' = 'application/json' }
  $body = @{ shopName = 'Presentation Shop'; date = (Get-Date -Format yyyy-MM-dd) } | ConvertTo-Json
  $q = Invoke-RestMethod -Uri 'http://localhost:4000/api/queues' -Method Post -Headers $headers -Body $body
  Log "Created queue id: $($q._id)"

  $tokenRes = Invoke-RestMethod -Uri "http://localhost:4000/api/queues/$($q._id)/token" -Method Post
  Log "Token response: $(($tokenRes | ConvertTo-Json -Compress))"

  $nextRes = Invoke-RestMethod -Uri "http://localhost:4000/api/queues/$($q._id)/next" -Method Post -Headers $headers
  Log "Called next: serving = $($nextRes.serving)"

  # Try skip (may error if no waiting tokens left)
  try {
    $skipRes = Invoke-RestMethod -Uri "http://localhost:4000/api/queues/$($q._id)/skip" -Method Post -Headers $headers
    Log "Skip response: $($skipRes | ConvertTo-Json -Compress)"
  } catch {
    Log "Skip returned error: $($_.Exception.Response.Content)"
  }

  $endRes = Invoke-RestMethod -Uri "http://localhost:4000/api/queues/$($q._id)/end" -Method Post -Headers $headers
  Log 'Queue ended'

  # Save demo state for later
  $state = @{ queueId = $q._id; createdAt = (Get-Date).ToString(); tokenResponse = $tokenRes }
  $state | ConvertTo-Json | Out-File -FilePath (Join-Path $demoDir 'demo_state.json') -Encoding utf8
  Log "Saved demo state to .demo/demo_state.json"
} catch {
  Log "Demo flow error: $($_.Exception.Message)"
}

Pop-Location
Log 'run_demo.ps1 finished (servers continue running in background). Use stop_demo.ps1 to stop them.'
