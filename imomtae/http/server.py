from fastapi import FastAPI
from typing import Any, Callable, List, Type


"""Mount"""

from fastapi.staticfiles import StaticFiles

class Mount:
    def __init__(self, path: str, endpoint: Callable[..., Any], name: str):
        self._path = path
        self._endpoint = endpoint
        self._name = name

    def register(self, app: FastAPI):
        app.mount(self._path, self._endpoint, name=self._name)


def templates() -> Mount:
    return Mount("/templates", StaticFiles(directory="./imomtae/http/templates"), name="templates")

def videos() -> Mount:
    return Mount("/videos", StaticFiles(directory="data/solution_videos"), name="videos")


"""Middleware"""

from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

class Middleware:
    def __init__(self, middleware_class: Type[Any], **options: Any):
        self.middleware_class = middleware_class
        self.options = options

    def register(self, app: FastAPI):
        app.add_middleware(self.middleware_class, **self.options)

def session() -> Middleware:
    return Middleware(middleware_class=SessionMiddleware, secret_key="secret")

def cors() -> Middleware:
    return Middleware(
        middleware_class=CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


"""Router"""

from fastapi import APIRouter

class Router:
    def __init__(
        self, path: str, methods: List[str], endpoint: Callable[..., Any], dependencies: List[Any] = []
    ):
        self._path = path
        self._methods = methods
        self._endpoint = endpoint
        self._dependencies = dependencies

    def register(self, app: FastAPI):
        router = APIRouter()
        router.add_api_route(
            path=self._path,
            methods=self._methods,
            endpoint=self._endpoint,
            dependencies=self._dependencies,
        )
        app.include_router(router)


"""Tasks"""

from contextlib import contextmanager
from typing import Callable, List

class Task:
    def __init__(
        self, 
        startup: List[Callable] | None = None, 
        shutdown: List[Callable]| None = None,
    ):
        self.startup: List[Callable] = (
            startup if startup else []
        )
        self.shutdown: List[Callable] = (
            shutdown if shutdown else []
        )

    def add_startup(self, task: Callable):
        self.startup.append(task)
        return self

    def add_shutdown(self, task: Callable):
        self.shutdown.append(task)
        return self
    
    def get_lifespan(self):
        @contextmanager
        def lifespan(app: FastAPI):
            print("Running startup tasks...")
            for task in self.startup:
                task()
                
            yield
            
            print("Running shutdown tasks...")
            for task in self.shutdown:
                task()

def lifespan(startup: List[Callable]=[], shutdown: List[Callable]=[]) -> Task:
    return Task(
        startup=startup,
        shutdown=shutdown,
    )


"""Exception"""

from fastapi import Request
from fastapi.responses import JSONResponse
from imomtae.error.service_error import ServiceError

class ExceptionHandler:
    def __init__(self, exception: Type[Exception], handler: Callable[..., Any]):
        self._exception = exception
        self._handler = handler

    def register(self, app: FastAPI):
        app.add_exception_handler(self._exception, self._handler)

def service_error_handler() -> "ExceptionHandler":
    def handler(request: Request, exc: ServiceError) -> JSONResponse:
        return JSONResponse(
            content={"error": exc.msg, "handler": "service_error_handler"},
            status_code=exc.code,
        )
    
    return ExceptionHandler(
        exception=ServiceError,
        handler=handler
    )


"""Server"""

class Server:
    def __init__(self, name: str):
        self._name = name
        self._app = FastAPI()
        self._mounts: List[Mount] = []
        self._middlewares: List[Middleware] = []
        self._routers: List[Router] = []
        self._task: Task | None = None
        self._exceptions: List[ExceptionHandler] = []

    def mount(self, mount: Mount):
        self._mounts.append(mount)

    def middleware(self, middleware: Middleware):
        self._middlewares.append(middleware)

    def router(self, router: Router):
        self._routers.append(router)

    def task(self, task: Task):
        self._task = task
        
    def exception(self, exception: ExceptionHandler):
        self._exceptions.append(exception)

    def app(self) -> FastAPI:
        if self._task:
            self._app = FastAPI(lifespan=self._task.get_lifespan())

        for mount in self._mounts:
            mount.register(self._app)

        for middleware in self._middlewares:
            middleware.register(self._app)

        for router in self._routers:
            router.register(self._app)
            
        for exception in self._exceptions:
            exception.register(self._app)

        return self._app