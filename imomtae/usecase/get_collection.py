from pathlib import Path

from imomtae.config import DBConfig
from imomtae.repository.collections import CollectionGet

db_config=DBConfig()


"""Command"""

"""Query"""

def get_video_by_user_id(
    user_id: str,
    db=Path(db_config.DB_PATH),
) -> dict:
    
    collection = CollectionGet.get_by_user_id(db, user_id=user_id)
    if collection is None:
        raise
    
    return collection


def get_video_by_user_id_and_video_id(
    user_id: str, 
    video_id: str,
    db=Path(db_config.DB_PATH),
) -> str:
    
    collection = get_video_by_user_id(user_id=user_id)
    if collection is None:
        raise
    
    video = collection.get(f"path{video_id}", None)
    if video is None:
        raise
    
    return video