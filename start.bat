@echo off
cd /d "%~dp0"
echo Starting VendorSync AI Backend Process...
".venv\Scripts\python.exe" run_server.py
pause
