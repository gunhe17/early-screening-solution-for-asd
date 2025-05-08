import os
import time
import cv2

from imomtae.config import CameraConfig


def record(
    video_id: int, 
    user_id: str
) -> bool:

    video_path = f"test/data/step{video_id}.mp4"
    duration = _duration(video_path)
    if duration <= 0:
        print("❌ 기준 영상 길이 계산 실패")
        return False

    os.makedirs(f"src/{user_id}", exist_ok=True)

    # 각 장치에 대한 VideoCapture 및 VideoWriter 설정
    caps = []
    outs = []
    camera_config = CameraConfig()
    for i, device_index in enumerate(camera_config.INDEX_LIST):
        cap = cv2.VideoCapture(device_index)
        if not cap.isOpened():
            print(f"❌ 카메라 {device_index} 열기 실패")
            # 모든 열었던 장치 정리 후 종료
            for c in caps:
                c.release()
            return False

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 640)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 480)
        fps = int(cap.get(cv2.CAP_PROP_FPS) or 30)

        output_path = f"src/{user_id}/step{video_id}_cam{i + 1}.avi"
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        caps.append(cap)
        outs.append(out)

        print(f"🎥 카메라 {device_index} 녹화 준비 → {output_path}")

    print(f"⏱ 녹화 시작 ({duration}초 동안)")

    start_time = time.time()
    while time.time() - start_time < duration:
        for cap, out, idx in zip(caps, outs, range(len(caps))):
            ret, frame = cap.read()
            if not ret:
                print(f"⚠️ 카메라 {idx + 1} 프레임 읽기 실패")
                continue
            out.write(frame)

    for cap in caps:
        cap.release()
    for out in outs:
        out.release()

    print("✅ 모든 카메라 녹화 완료")
    return True


def _duration(video_path: str) -> int:
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return 0

    fps = video.get(cv2.CAP_PROP_FPS)
    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = int(frame_count / fps) + 3 if fps else 0

    video.release()
    return duration
