from contextlib import asynccontextmanager
from core.database import engine, Base
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from auth.models import User
from auth.routes import router as auth_router
from passwords.routes import router as pass_router
from core.error_response import format_error
from core.logging_config import logger
from core.dependencies import oauth2_scheme


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


origins = [
    "http://localhost:5173",
    "https://your-frontend-domain.com"
]


app = FastAPI(title="Pass-Vault", version="1.2", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to Pass-Vault API!"}

app.include_router(auth_router)
app.include_router(pass_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}")
    return format_error("Internal Server Error", 500)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation error occurred",
            "code": 422,
            "details": [
                {
                    "field": err["loc"][-1],
                    "message": err["msg"],
                    "type": err["type"]
                }
                for err in exc.errors()
            ]
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail if isinstance(exc.detail, str) else "Something went wrong",
            "code": exc.status_code,
            "detail": exc.detail if isinstance(exc.detail, dict) else None
        }
    )


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="PassVault API",
        version="1.0.0",
        description="Secure backend using JWT token auth",
        routes=app.routes,
    )
    # Override the OAuth2 security scheme to use Bearer
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for route in app.routes:
        if isinstance(route, APIRoute):
            if any(dep.dependencies == oauth2_scheme for dep in route.dependant.dependencies):
                path = route.path
                method = list(route.methods)[0].lower()
                openapi_schema["paths"][path][method]["security"] = [{"OAuth2PasswordBearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
