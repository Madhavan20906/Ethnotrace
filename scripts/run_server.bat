@echo off
echo Starting EthnoTrace Server on http://127.0.0.1:8000 ...
cd /d "%~dp0\.."
.\venv\Scripts\python.exe -m backend.main
pause
