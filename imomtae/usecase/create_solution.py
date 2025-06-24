import cv2
from pathlib import Path

from imomtae.config import DBConfig
from imomtae.repository.solutions import (
    SolutionCreate,
    Solution
)

db_config=DBConfig()


def create(
    db=Path(db_config.DB_PATH)
) -> list[dict]:

    video_index = 0
    solutions = []

    for v in Path(db_config.SOLUTION_PATH).rglob("*.mp4"):
        video_index += 1
        video_path = str(v)
        video_duration = _duration(str(video_path))
        solutions.append(
            Solution.from_dict({
                "id":video_index,
                "path":video_path,
                "duration":video_duration,
            })
        )
    
    created = SolutionCreate.multi(
        db,
        solutions=solutions
    )
    
    return created


"""private"""

def _duration(video_path: str) -> float | None:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None
    
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = frame_count / fps if fps > 0 else None
    
    cap.release()
    return duration


"""CLI"""

def main():
    create()

if __name__ == "__main__":
    main()