from pathlib import Path
import json
import uuid

from imomtae.config import DBConfig
from imomtae.error.service_error import ExistingUserError

db = Path(DBConfig().DB_PATH)


##
# Model

class User:
    def __init__(
        self,
        id: str,
        name: str,
        birth: str   
    ):
        self.id=id
        self.name=name
        self.birth=birth
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "birth": self.birth,
        }
        
    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            name=data["name"],
            birth=data["birth"],
        )

##
# Command

class UserCreate:
    @classmethod
    def execute(
        cls,
        db,
        user: User,
    ) -> dict:  
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}
    
        users = dson.setdefault("users", [])
        
        # ERROR: if existing
        for existing in users:
            if (
                existing["name"] == user.name
                and
                existing["birth"] == user.birth
            ):
                raise ExistingUserError()
            
        users.append(
            user.to_dict()
        )
        
        with db.open("w", encoding="utf-8") as f:
            json.dump(dson, f, indent=2)
            
        created = (
            user.to_dict()
        )
                
        return created