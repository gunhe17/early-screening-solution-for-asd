import cv2
from imomtae.config import CameraConfig


def ready() -> dict:
    results = {}

    camera_config = CameraConfig()

    for i, device_index in enumerate(camera_config.INDEX_LIST):
        cam_key = f"cam{i + 1}"

        # step 1: 장치 열기
        cap = cv2.VideoCapture(device_index)
        if not cap.isOpened():
            results[cam_key] = "not opened"
            cap.release()
            continue

        # step 2: 프레임 확인
        ret, frame = cap.read()
        cap.release()

        if not ret or frame is None or frame.size == 0:
            results[cam_key] = "no frame"
        else:
            results[cam_key] = "ok"

    return results