from fastapi.responses import (
    StreamingResponse,
    JSONResponse,
)
from pydantic import BaseModel
import asyncio

from imomtae.usecase.fetch_openai import fetch


"""Command"""

class PostOpenaiInput(BaseModel):
    text: str


async def post_openai(input: PostOpenaiInput):
    try:
        audio_stream = await asyncio.to_thread(
            fetch,
            text=input.text,
        )
        
        return StreamingResponse(
            _stream_audio(audio_stream),
            media_type='mp3',
            headers={
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)}
        )


"""Helper"""

async def _stream_audio(audio_stream):
    try:
        chunk_size = 8192
        
        while True:
            chunk = audio_stream.read(chunk_size)
            if not chunk:
                break
            yield chunk
            await asyncio.sleep(0)
            
    finally:
        audio_stream.close()