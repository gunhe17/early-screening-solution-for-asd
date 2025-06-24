import json


##
# Model

class Solution:
    def __init__(
        self, 
        id: str, 
        path: str,
        duration: str,
    ):
        self.id = id
        self.path = path
        self.duration = duration

    def to_dict(self):
        return {
            "id": self.id,
            "path": self.path,
            "duration": self.duration,
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            path=data["path"],
            duration=data["duration"],
        )

##
# Command

class SolutionCreate:
    @classmethod
    def execute(
        cls, 
        db,
        solution: Solution, 
    ):
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}

        solutions = dson.setdefault("solutions", [])

        # ERROR: if existing
        for existing in solutions:
            if existing["id"] == solution.id:
                return None
            
            if existing["path"] == solution.path:
                return None

        solutions.append(
            solution.to_dict()
        )

        with db.open("w", encoding="utf-8") as f:
            json.dump(dson, f, indent=2)
            
        created = (
            solution.to_dict()
        )

        return created
    
    @classmethod
    def multi(
        cls,
        db,
        solutions: list[Solution],
    ):
        created = []

        for s in solutions:
            single_created = cls.execute(
                db=db,
                solution=s
            )
            created.append(single_created)
        
        return created


##
# Query

class SolutionGet:
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

        solution = [
            s for s in dson.get("solutions", []) if s["id"] == int(id)
        ][0]
        getted = (
            Solution.from_dict(solution).to_dict()
        )

        return getted

    @classmethod
    def get_all(
        cls, 
        db,
    ):
        with db.open("r", encoding="utf-8") as f:
            try:
                dson = json.load(f)
            except json.JSONDecodeError:
                dson = {}
            
        solutions = (
            dson.get("solutions", [])
        )
        getted = [
            Solution.from_dict(s).to_dict() for s in solutions
        ]
        
        return getted