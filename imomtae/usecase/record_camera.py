import subprocess
from pathlib import Path

from imomtae.config import (
    DBConfig,
    SystemConfig,
    CameraConfig,
)

db_config = DBConfig()
system_config = SystemConfig()
camera_config = CameraConfig()


def record(
    video_id: int, 
    user_id: str,
    db=Path(db_config.DB_PATH),
) -> bool:

    # Skip
    if system_config.OS != "Windows": 
        return True
    
    record_duraion: int = (
        5 + # wait(start)
        5 + # wait(end)
        _record_duraion(video_id=video_id) 
    )

    subprocess.run([
        system_config.EXE_CAPTURE,
        "--camera_indices",     f"{camera_config.INDEX_LIST}",
        "--record_duration",    f"{record_duraion}",
        "--output_dir",         f"{db_config.COLLECTION_PATH}/{user_id}",
    ])

    return True


"""private"""

def _record_duraion(video_id):
    from imomtae.repository.solutions import SolutionGet
    solutions = SolutionGet.get_all(
        db=Path(db_config.DB_PATH)
    )
    
    videos = [
        s for s in solutions if s['id'] >= video_id
    ]
    
    durations = [
        int(v['duration']) for v in videos
    ]
    
    return sum(durations)


"""CLI"""

def get_arguments():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--video_id", type=int, required=False)
    parser.add_argument("--user_id", type=str, required=False)

    args = parser.parse_args()

    return args

def main():
    args = get_arguments()

    record(
        args.video_id,
        args.user_id
    )

if __name__ == "__main__":
    main()