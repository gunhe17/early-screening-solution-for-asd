from fastapi.responses import JSONResponse
from pydantic import BaseModel

from imomtae.usecase.ready_camera import ready
from imomtae.usecase.record_camera import (
    record,
    stop
)


"""Command"""

class PostReadyInput(BaseModel):
    pass

async def post_ready():
    is_ready = ready()

    return JSONResponse(content={
        "data": is_ready
    })


class PostRecordInput(BaseModel):
    video_id: int
    user_id: str

async def post_record(input: PostRecordInput):
    is_record = record(
        video_id=input.video_id, 
        user_id=input.user_id,
    )

    return JSONResponse(content={
        "data": is_record
    })

class PostStopInput(BaseModel):
    user_id: str

async def post_stop(input: PostStopInput):
    is_stopped = stop(input.user_id)

    return JSONResponse(content={
        "data": is_stopped
    })