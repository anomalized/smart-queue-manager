<#
create_shortcut.ps1

Creates a desktop shortcut that launches run_demo.bat in this repo.
Usage: run this script from the repo root (it uses its own location to find run_demo.bat).
#>

Set-StrictMode -Version Latest
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$target = Join-Path $scriptDir 'run_demo.bat'
if (-not (Test-Path $target)) { Write-Error "Cannot find $target"; exit 1 }

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Smart Queue Demo.lnk'

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $scriptDir
$shortcut.WindowStyle = 1
$shortcut.Description = 'Start Smart Queue Manager demo (backend + frontend)'
# Optional: set icon to cmd.exe icon
$sysIcon = Join-Path $env:windir 'System32\shell32.dll'
$shortcut.IconLocation = "$sysIcon, 1"
$shortcut.Save()

Write-Output "Created shortcut: $shortcutPath"
