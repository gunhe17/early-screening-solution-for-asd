from fastapi.responses import FileResponse, JSONResponse


"""Query"""

async def get_monitor_video(user_id: str, video_id: int) -> FileResponse:

    video = f"src/{user_id}/cam_{video_id}.mp4"

    return FileResponse(path=video)


async def get_monitor_time(user_id: str, video_id: int) -> JSONResponse:
    relative_list = []
    utc_list = []

    with open(f"src/{user_id}/cam_{video_id}_log.csv", "r", encoding="utf-8") as f:
        next(f)
        for i, line in enumerate(f):
            fields = line.strip().split(",")
            if len(fields) >= 5:
                try:
                    relative_time = int(fields[2])
                    relative_list.append(relative_time)

                    utc_time = fields[4]
                    utc_list.append(utc_time)
                except ValueError:
                    continue

    return JSONResponse(content={
        "data": {
            "relative_time": relative_list,
            "absolute_time": utc_list
        }
    })
