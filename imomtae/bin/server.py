from imomtae.http.server import (
    templates, 
    session, 
    cors,
    Router,
    Server,
)
from imomtae.http.endpoints.user import (
    post_user,
)
from imomtae.http.endpoints.video import (
    get_video,
)
from imomtae.http.endpoints.monitor import (
    get_monitor_video,
    get_monitor_time,
)
from imomtae.http.endpoints.camera import (
    post_ready,
    post_record,
)
from imomtae.http.endpoints.view import (
    home_page,
    capture_page,
    monitor_page,
)


# #
# server

server = Server(name="imomtae")


# #
# mount

server.mount(
    mount=templates()
)


# #
# middleware

server.middleware(
    middleware=session()
)

server.middleware(
    middleware=cors()
)


# #
# API: back

# user
server.router(
    Router(path="/backend-api/user", methods=["POST"], endpoint=post_user, dependencies=[])
)

# video
server.router(
    Router(path="/backend-api/video", methods=["GET"], endpoint=get_video, dependencies=[])
)

# monitor
server.router(
    Router(path="/backend-api/monitor/video/u/{user_id}/v/{video_id}", methods=["GET"], endpoint=get_monitor_video, dependencies=[])
)

server.router(
    Router(path="/backend-api/monitor/time/u/{user_id}/v/{video_id}", methods=["GET"], endpoint=get_monitor_time, dependencies=[])
)

# camera
server.router(
    Router(path="/backend-api/camera/ready", methods=["POST"], endpoint=post_ready, dependencies=[])
)

server.router(
    Router(path="/backend-api/camera/record", methods=["POST"], endpoint=post_record, dependencies=[])
)


# #
# API: front

# home
server.router(
    Router(path="/home", methods=["GET"], endpoint=home_page, dependencies=[])
)

# capture
server.router(
    Router(path="/capture/u/{user_id}/v/{video_id}", methods=["GET"], endpoint=capture_page, dependencies=[])
)

# monitor
server.router(
    Router(path="/monitor/u/{user_id}", methods=["GET"], endpoint=monitor_page, dependencies=[])
)


# #
# server

app = server.app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("imomtae.bin.server:app", host="0.0.0.0", port=5000, reload=True)