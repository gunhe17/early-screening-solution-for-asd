from pathlib import Path

from imomtae.config import DBConfig
from imomtae.repository.users import (
    UserCreate,
    User
)

db_config=DBConfig()


"""Command"""

def create(
    name: str,
    birth: str,
    center: str,
    type: str,
    called: str | None = None,
    db=Path(db_config.DB_PATH),
) -> dict:
    
    created = UserCreate.execute(
        db,
        user=User.from_dict({
            "name": name,
            "birth": birth,
            "center": center,
            "type": type,
            "called": called
        })
    )
    if created is None:
        raise
    
    return created


"""Query"""