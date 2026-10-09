# Startup script for VendorSync AI
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Starting VendorSync AI Backend Process..." -ForegroundColor Green
& "$ScriptDir\.venv\Scripts\python.exe" "$ScriptDir\run_server.py"
