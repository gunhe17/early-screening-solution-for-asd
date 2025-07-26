from pathlib import Path
import os

from imomtae.config import DBConfig
from imomtae.repository.users import UserGet

db_config=DBConfig()


"""Command"""

"""Query"""

def get_by_id(
    id: str,
    db=Path(db_config.DB_PATH),
) -> dict:
    
    user = UserGet.get_by_id(db, id=id)
    if user is None:
        raise
    
    return user