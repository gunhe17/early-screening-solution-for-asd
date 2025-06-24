from fastapi import Request
from fastapi.responses import (
    StreamingResponse,
    JSONResponse, 
    FileResponse, 
)

import aiofiles
import asyncio
import logging
import os

from imomtae.usecase.create_solution import (
    create
)
from imomtae.usecase.get_solution import (
    get_by_id,
    get_video_by_id,
    get_all,
)


"""Command"""

async def create_solution():
    solution = create()

    return JSONResponse(content={
        "data": solution
    })


"""Query"""

async def get_solution_by_id(
    video_id: str
):
    solution = get_by_id(
        video_id=video_id
    )
    
    return JSONResponse(content={
        "data": solution
    })


async def get_solution_video_by_id(
    request: Request,
    video_id: str
):
    video_path = get_video_by_id(video_id=video_id)
    
    return StreamingResponse(
        _to_stream(video_path, request),
        media_type="video/mp4"
    )


async def get_every_solution(      
):
    solutions = get_all()

    return JSONResponse(content={
        "data": solutions
    })


"""Helper"""

async def _to_stream(video_path: str, request: Request):
    file_size = os.path.getsize(video_path)
    range_header = request.headers.get('Range')
    
    if range_header:
        start, end = _parse_range(range_header, file_size)
        
        async with aiofiles.open(video_path, 'rb') as f:
            await f.seek(start)
            remaining = end - start + 1
            while remaining:
                chunk_size = min(1024 * 1024, remaining)
                chunk = await f.read(chunk_size)
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk
    else:
        async with aiofiles.open(video_path, 'rb') as f:
            while chunk := await f.read(1024 * 1024):
                yield chunk

def _parse_range(range_header: str, file_size: int):
    start, end = 0, file_size - 1
    range_value = range_header.replace('bytes=', '')
    if '-' in range_value:
        s, e = range_value.split('-')
        if s: start = int(s)
        if e: end = int(e)
    return start, end