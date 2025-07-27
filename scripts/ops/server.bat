@echo off

set PYTHONPATH=.

call .\.venv\Scripts\activate.bat

pip install -r requirements.txt

python imomtae\usecase\create_solution.py
python imomtae\bin\server.py