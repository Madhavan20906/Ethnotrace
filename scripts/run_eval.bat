@echo off
echo Running EthnoTrace Scientific Benchmark Evaluation...
cd /d "%~dp0\.."
.\venv\Scripts\python.exe ml/evaluation/benchmark_eval.py
pause
