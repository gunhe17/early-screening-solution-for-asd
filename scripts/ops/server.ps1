$env:PYTHONPATH = "."

.\.venv\Scripts\activate
pip install -r .\requirements.txt

python imomtae\usecase\create_solution.py

python imomtae\bin\server.py