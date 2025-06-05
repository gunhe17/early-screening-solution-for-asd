from fastapi.responses import JSONResponse
from fastapi import APIRouter
from pydantic import BaseModel

from imomtae.config import DBConfig
from imomtae.usecase.post_user import create


router = APIRouter()


"""Command"""

class PostUserInput(BaseModel):
    name: str
    birth: str

@router.post("/users")
async def post_user(input: PostUserInput):
    user_name = input.name
    user_birth = input.birth

    created_user = create(
        name=user_name,
        birth=user_birth,
    )

    print(f"Created user: {created_user}")

    return JSONResponse(content={
        "data": {
            "id": created_user["id"],
            "name": created_user["name"],
            "birth": created_user["birth"],
        }
    })
