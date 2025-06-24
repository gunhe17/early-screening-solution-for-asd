from imomtae.http.server import (
    templates, 
    session, 
    cors,
    lifespan,
    service_error_handler,
    Task,
    Router,
    Server,
    ExceptionHandler,
)
from imomtae.http.endpoints.user import (
    post_user,
)
from imomtae.http.endpoints.solution import (
    get_solution_by_id,
    get_solution_video_by_id,
    get_every_solution,
)
from imomtae.http.endpoints.collection import (
    get_collection_by_id,
    get_collection_video_by_user_id_and_video_id,
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
# Task

server.task(
    task=lifespan(startup=[])
)

# #
# exception

server.exception(
    exception=service_error_handler()
)


# #
# API: back

# user
server.router(
    Router(path="/backend-api/user", methods=["POST"], endpoint=post_user, dependencies=[])
)

# video
server.router(
    Router(path="/backend-api/solution/v/{video_id}", methods=["GET"], endpoint=get_solution_video_by_id, dependencies=[])
)

server.router(
    Router(path="/backend-api/solution", methods=["GET"], endpoint=get_every_solution, dependencies=[])
)

server.router(
    Router(path="/backend-api/collection/video/u/{user_id}/v/{video_id}", methods=["GET"], endpoint=get_collection_video_by_user_id_and_video_id, dependencies=[])
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
    uvicorn.run(
        "imomtae.bin.server:app", 
        host="0.0.0.0", 
        port=5000, 
        reload=True,
    )