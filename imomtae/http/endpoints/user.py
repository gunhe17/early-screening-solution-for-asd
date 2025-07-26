from fastapi.responses import JSONResponse
from pydantic import BaseModel

from imomtae.usecase.create_user import create
from imomtae.usecase.get_user import get_by_id


"""Command"""

class PostUserInput(BaseModel):
    name: str
    birth: str
    center: str
    type: str
    called: str | None = None

async def post_user(input: PostUserInput):
    user = create(
        name=input.name, 
        birth=input.birth,
        center=input.center,
        type=input.type,
        called=input.called
    )

    return JSONResponse(content={
        "data": user
    })


"""Query"""

async def get_user_by_id(
    id: str
):
    user = get_by_id(
        id=id
    )

    return JSONResponse(content={
        "data": user
    })