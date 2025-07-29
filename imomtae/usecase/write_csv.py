from pathlib import Path

"""command"""

def write(
    user_id: str,
    time: str,
    type: str,
    video_id: str,
) -> bool:
    
    csv_path = Path(f"data/collection_videos/{user_id}/play.csv")
    
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    if not csv_path.exists():
        with csv_path.open("w", encoding="utf-8") as f:
            f.write("user_id,time,type,video_id\n")

    with csv_path.open("a", encoding="utf-8") as f:
        f.write(f"{user_id},{time},{type},{video_id}\n")

    return True