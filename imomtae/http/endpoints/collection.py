from fastapi.responses import (
    FileResponse,
)

from imomtae.usecase.get_collection import (
    get_video_by_user_id_and_video_id
)


"""Command"""

"""Query"""

async def get_collection_by_id(      
):
    pass

async def get_collection_video_by_user_id_and_video_id(
    user_id: str, 
    video_id: str
) -> FileResponse:
    
    video = get_video_by_user_id_and_video_id(
        user_id=user_id,
        video_id=video_id
    )

    return FileResponse(path=video)