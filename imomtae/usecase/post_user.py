from pathlib import Path
import json
import uuid

from imomtae.config import DBConfig


def create(
    name: str,
    birth: str,
) -> dict:
    id = str(
        uuid.uuid4()
    )
    db_path = Path(DBConfig().DB_PATH)    

    if db_path.exists():
        with db_path.open("r", encoding="utf-8") as f:
            try:
                users = json.load(f)
            except json.JSONDecodeError:
                users = []
    else:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        users = []

    user = {
        "id": id,
        "name": name,
        "birth": birth,
    }
    users.append(user)

    with db_path.open("w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    
    return {
        "id": id,
        "name": name,
        "birth": birth,
    }