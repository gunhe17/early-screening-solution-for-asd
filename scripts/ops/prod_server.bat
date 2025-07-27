@echo off
set PYTHONPATH=.

call .\.venv\Scripts\activate.bat
pip install -r requirements.txt

python imomtae\usecase\create_solution.py
start "" python imomtae\bin\server.py

timeout /t 3 >nul

taskkill /IM chrome.exe /F
timeout /t 1 >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --start-fullscreen http://localhost:5000/home