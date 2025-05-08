from fastapi.responses import FileResponse


"""Query"""

async def get_video(video_id: int) -> FileResponse:

    # video
    video = f"test/data/step{video_id}.mp4"

    return FileResponse(path=video)