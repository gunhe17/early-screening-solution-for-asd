import os
import cv2
import subprocess

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

    camera_config = CameraConfig()
    
    camera_indexes = camera_config.INDEX_LIST
    cam_args = [
        str(idx) for idx in camera_indexes[:6]
    ] + [
        "-1"
    ] * (6 - len(camera_indexes))

    args = [
        "1280",             # width
        "720",              # height
        "30",               # fps
        f"{duration}",               # duration_sec
        "ffmpeg",           # ffmpeg_path
        f"src/{user_id}"    # output_dir
    ] + cam_args

    # 실행
    subprocess.run(["capture.exe"] + args)

    print("✅ 모든 카메라 녹화 완료")
    return True


def _duration(video_path: str, delay: int = 5) -> int:
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return 0

    fps = video.get(cv2.CAP_PROP_FPS)
    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = int(frame_count / fps) if fps else 0

    duration = duration + delay

    print(f"기준 영상 길이: {duration}초")

    video.release()
    return duration