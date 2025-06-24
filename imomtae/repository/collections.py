import json


##
# Model

class Collection:
    def __init__(
        self, 
        id: str, 
        user_id: str, 
        path1: str | None = None,
        path2: str | None = None,
        path3: str | None = None,
    ):
        self.id = id
        self.user_id = user_id
        self.path1 = path1
        self.path2 = path2
        self.path3 = path3

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "path1": self.path1,
            "path2": self.path2,
            "path3": self.path3,
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            user_id=data["user_id"],
            path1=data.get("path1"),
            path2=data.get("path2"),
            path3=data.get("path3"),
        )

##
# Command

class CollectionCreate:
    @classmethod
    def execute(
        cls, 
        db,
        collection: Collection, 
    ):
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}

        collections = dson.setdefault("collections", [])
        
        # ERROR: if existing
        for existing in collections:
            if existing["id"] == collection.id:
                return None
            
        collections.append(
            collection.to_dict()
        )

        with db.open("w", encoding="utf-8") as f:
            json.dump(dson, f, indent=2)
        
        created = (
            collection.to_dict()
        )
        
        return created

##
# Query

class CollectionGet:
    @classmethod
    def get_by_user_id(
        cls, 
        db,
        user_id: str, 
    ):
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}

        collection = [
            collection for collection in dson["collections"] if collection["user_id"] == user_id
        ][0]
        getted = (
            Collection.from_dict(collection).to_dict()
        )
        
        return getted