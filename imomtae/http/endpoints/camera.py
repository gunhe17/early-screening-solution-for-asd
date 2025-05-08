from fastapi.responses import JSONResponse

from imomtae.usecase.ready_camera import ready
from imomtae.usecase.record_camera import record_multi


"""Command"""

async def post_ready():
    status = {}

    for i in [1]:
        is_ready = ready(i)
        status[f"cam{i + 1}"] = (
            "ready" if is_ready else "not ready"
        )

    return JSONResponse(content={
        "data": status
    })

async def post_record(
    video_id: int,
    user_id: int,
):
    is_record = record_multi(video_id, user_id)

    return JSONResponse(content={
        "data": {
            "message": "record",
            "is_record": is_record
        }
    })
