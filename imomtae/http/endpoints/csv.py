from fastapi.responses import JSONResponse
from pydantic import BaseModel

from imomtae.usecase.write_csv import (
    write
)


"""Command"""

class PostCSVInput(BaseModel):
    user_id: str
    time: str
    type: str
    video_id: str

async def post_csv(input: PostCSVInput):
    write(
        user_id=input.user_id,
        time=input.time,
        type=input.type,
        video_id=input.video_id,
    )

    return JSONResponse(content={
        "data": "CSV written successfully"
    })