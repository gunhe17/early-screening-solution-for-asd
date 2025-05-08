from fastapi.responses import JSONResponse

from imomtae.usecase.ready_camera import ready
from imomtae.usecase.record_camera import record


"""Command"""

async def post_ready():

    is_ready = ready()

    return JSONResponse(content={
        "data": is_ready
    })

async def post_record(
    video_id: int,
    user_id: int,
):
    is_record = record(video_id, user_id)

    return JSONResponse(content={
        "data": is_record
    })