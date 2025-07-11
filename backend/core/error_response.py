from fastapi.responses import JSONResponse


def format_error(message: str, status_code: int):
    return JSONResponse(
        status_code=status_code,
        content={"error": True, "message": message, "code": status_code}
    )
