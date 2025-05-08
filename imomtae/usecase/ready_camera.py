import cv2

def ready(device_index=0) -> bool:
    print("\n")

    # is opened
    cap = cv2.VideoCapture(device_index)
    print("::CAP", cap)

    if not cap.isOpened():
        cap.release()
        return False
    print("::CAP.isOpened()", cap.isOpened())

    # is ready
    ret, frame = cap.read()
    cap.release()
    print("::ret", ret)
    print("::frame", frame)

    return ret and frame is not None