from fastapi.templating import Jinja2Templates
from fastapi import Request


# #
# Config

templates = Jinja2Templates(directory="./imomtae/http/templates")


# #
# page

async def home_page(request: Request):
    return templates.TemplateResponse("home/page.html", {
        "request": request
    })

async def capture_page(request: Request, user_id: str, video_id: int):
    return templates.TemplateResponse("capture/page.html", {
        "request": request,
    })