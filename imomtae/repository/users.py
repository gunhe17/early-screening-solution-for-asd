from typing import Literal
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
        birth: str,
        center: str,
        type: Literal["A", "B"], # A: ASD, B: Non-ASD
        called: str | None = None
    ):
        self.id=id
        self.name=name
        self.birth=birth
        self.center=center
        self.type=type
        self.called=called

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            name=data["name"],
            birth=data["birth"],
            center=data["center"],
            type=data["type"],
            called=(
                data["called"] 
                if data.get("called") else None
            )
        )
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "birth": self.birth,
            "center": self.center,
            "type": self.type,
            "called": (
                self.called
                if self.called is not None else None
            )
        }
        

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
                and
                existing["center"] == user.center
            ):
                raise ExistingUserError()
            
        users.append(
            user.to_dict()
        )
        
        with db.open("w", encoding="utf-8") as f:
            json.dump(dson, f, indent=2, ensure_ascii=False)
            
        created = (
            user.to_dict()
        )
                
        return created
    

##
# Query

class UserGet:
    @classmethod
    def get_by_id(
        cls,
        db,
        id: str,
    ):
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}
    
        user = [
            u for u in dson.get("users", []) if u["id"] == id
        ][0] 
        
        getted = (
            User.from_dict(user).to_dict()
        )

        return getted
        