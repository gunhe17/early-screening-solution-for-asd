export PYTHONPATH=.
python3 imomtae/usecase/create_solution.py
python3 imomtae/bin/server.py &

sleep 3
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk http://localhost:5000/home