@echo off
echo Running EthnoTrace Automated Test Suite...
cd /d "%~dp0\.."
.\venv\Scripts\python.exe -m pytest backend/tests -v
pause
