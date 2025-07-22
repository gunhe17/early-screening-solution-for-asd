from pathlib import Path
import subprocess
import re

from imomtae.config import (
    DBConfig,
    SystemConfig,
    CameraConfig,
)

db_config = DBConfig()
system_config = SystemConfig()
camera_config = CameraConfig()


"""Helper"""

class ProcessManager:
    _processes: dict[str, subprocess.Popen] = {}
    
    @classmethod
    def add_process(cls, user_id: str, process: subprocess.Popen):
        cls._processes[user_id] = process
    
    @classmethod
    def get_process(cls, user_id: str) -> subprocess.Popen | None:
        return cls._processes.get(user_id)

    @classmethod
    def remove_process(cls, user_id: str):
        if user_id in cls._processes:
            del cls._processes[user_id]
    
    @classmethod
    def stop_process(cls, user_id: str) -> bool:
        process = cls.get_process(user_id)
        if not process:
            return False
            
        try:
            print(f"[Stop] Terminating process {user_id}...")
            
            process.terminate()
            
            try:
                process.wait(timeout=15)
                print(f"[Stop] Process {user_id} terminated gracefully")
            except subprocess.TimeoutExpired:
                print(f"[Stop] Process {user_id} force killing...")
                process.kill()
                process.wait()
                print(f"[Stop] Process {user_id} killed")
            
            cls.remove_process(user_id)
            return True
            
        except Exception as e:
            print(f"[Stop] Error: {e}")
            cls.remove_process(user_id)
            return False
        
process_manager = ProcessManager()


##
# Usecase

def record(
    video_id: int, 
    user_id: str,
    db=Path(db_config.DB_PATH),
) -> bool:

    # Skip
    if system_config.OS != "Windows": 
        return True
    
    record_duration: int = (
        5 + # wait(start)
        5 + # wait(end)
        _record_duration(video_id=video_id) 
    )

    output_dir = _output_dir(
        user_id
    )

    process = subprocess.Popen(
        [
            system_config.EXE_CAPTURE,
            "--record_duration",    f"{record_duration}",
            "--output_directory",   f"{output_dir}",
        ],
        stdin=subprocess.PIPE,
        # stdout=subprocess.PIPE,
        # stderr=subprocess.PIPE,
        text=True,
    )   

    process_manager.add_process(
        user_id, 
        process
    )

    return True

def stop(user_id: str) -> bool:
    return process_manager.stop_process(user_id)


"""private"""

def _record_duration(video_id):
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

def _output_dir(user_id: str):
    base = f"{db_config.COLLECTION_PATH}/{user_id}"

    dir = Path(base)
    if not dir.exists():
        return f"{base}/session_1"

    indices = [
        int(m.group(1))
        for d in dir.iterdir()
        if d.is_dir() and (m := re.match(r"session_(\d+)", d.name))
    ]

    return f"{base}/session_{max(indices, default=0) + 1}"


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