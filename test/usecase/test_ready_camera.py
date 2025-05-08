from imomtae.usecase.ready_camera import ready

def test_ready():
    
    value = ready(device_index=0)

    print(value)