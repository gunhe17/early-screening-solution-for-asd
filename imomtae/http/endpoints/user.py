from fastapi.responses import JSONResponse
from pydantic import BaseModel

from imomtae.usecase.create_user import create


"""Command"""

class PostUserInput(BaseModel):
    name: str
    birth: str

async def post_user(input: PostUserInput):
    user = create(
        name=input.name, 
        birth=input.birth
    )

    return JSONResponse(content={
        "data": user
    })