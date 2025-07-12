from fastapi import APIRouter, HTTPException, Request
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from . import crud, schemas
from . import utils
from core.logging_config import logger
from core.custom_exceptions import UserAlreadyExists, InvalidCredentials, PasswordPattern
from fastapi.responses import JSONResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-otp")
async def request_otp(email: schemas.UserBase, db: AsyncSession = Depends(get_db)):
    """
    Request an OTP for the given email address.

    Args:
        email (schemas.Email): The email address to send the OTP to.
        db (AsyncSession): The database session, injected by FastAPI. Defaults to Depends(get_db).

    Raises:
        HTTPException: If the email is not registered or if there is an internal server error.

    Returns:
        schemas.MessageResponse: A message indicating that the OTP has been sent.
    """
    try:
        return await crud.request_otp(email=email.email, db=db)
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP.")


@router.post("/verify-pass", response_model=schemas.MessageResponse)
async def verify_pass(data: schemas.VerifyPass, db: AsyncSession = Depends(get_db)):
    """
    Verify the password for the given email address.

    Args:
        email (schemas.Email): The email address to verify.
        db (AsyncSession): The database session, injected by FastAPI. Defaults to Depends(get_db).

    Raises:
        HTTPException: If the email is not registered or if there is an internal server error.

    Returns:
        schemas.MessageResponse: A message indicating that the password verification was successful.
    """
    try:
        return await crud.verify_update_pass(data=data, db=db)
    except InvalidCredentials as e:
        raise HTTPException(
            status_code=404, detail=f"Email not registered: {e}")
    except PasswordPattern as e:
        logger.warning(f"{e}")
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to verify password.")


@router.post('/verify-otp', response_model=schemas.MessageResponse)
async def verify_otp(data: schemas.OtpVerify, db: AsyncSession = Depends(get_db)):
    """
    Verify the OTP sent to the user's email.

    Args:
        data (schemas.OtpVerification): Contains the email and OTP to verify.
        db (AsyncSession): The database session, injected by FastAPI. Defaults to Depends(get_db).

    Raises:
        HTTPException: If the OTP is invalid or expired, or if there is an internal server error.

    Returns:
        schemas.MessageResponse: A message indicating whether the OTP verification was successful.
    """
    try:
        return await crud.verify_otp(data=data, db=db)
    except InvalidCredentials as e:
        raise HTTPException(status_code=400, detail=f"Invalid OTP: {e}")
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP.")


@router.post('/signup', response_model=schemas.UserOut)
async def add_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)) -> schemas.UserOut:
    """
    Register a new user in the system.

    Args:
        user (schemas.UserCreate): The data for the new user to be created.
        db (AsyncSession): The database session, injected by FastAPI. Defaults to Depends(get_db).

    Raises:
        HTTPException: If the email is already registered (status 400).
        HTTPException: If the password does not meet the required pattern (status 400).
        HTTPException: For any other unexpected server errors (status 500).

    Returns:
        schemas.UserOut: The created user data (excluding sensitive information like password).
    """
    logger.info(f"[SIGNUP] Attempt from {user.email}")
    try:
        return await crud.create_user(db, user)
    except UserAlreadyExists as e:
        logger.warning(f"[SIGNUP] User already exists: {e}")
        raise HTTPException(
            status_code=400, detail="Email already registered. Please login.")
    except PasswordPattern as e:
        logger.warning(f"[SIGNUP]: {e}")
        raise HTTPException(status_code=422, detail=f"{e}")
    except Exception as e:
        logger.error(f"[SIGNUP] Internal server error: {e}")
        raise HTTPException(status_code=500, detail=f"{e}")


@router.post('/signin')
async def user_login(user: schemas.UserLogin, db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """
    Authenticates a user and returns an access and refresh token.

    Args:
        user (schemas.UserLogin): User login credentials containing email and password.
        db (AsyncSession): Database session for querying the user data.

    Raises:
        HTTPException: If the credentials are invalid.
        HTTPException: For unexpected internal server errors.

    Returns:
        schemas.Token: A token response including access token, refresh token, and token type.
    """
    try:
        return await crud.login(user=user, db=db)
    except InvalidCredentials as e:
        logger.warning(f"{e}")
        raise HTTPException(status_code=404, detail="Invalid Credentials.")
    except Exception as e:
        logger.error(f"[SIGNIN] Internal server error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sign in user.")


@router.post("/refresh")
async def refresh_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = utils.decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=403, detail="Invalid token")

    access_token = utils.create_access_token({"sub": payload["sub"]})

    return JSONResponse(content={
        "access_token": access_token,
        "token_type": "bearer"
    })


@router.post('/forgot-password', response_model=schemas.ResetTokenResponse)
async def send_email(data: schemas.ForgotPassword, db: AsyncSession = Depends(get_db)):
    """
    Sends a password reset email to the user with a reset token.

    Args:
        data (schemas.ForgotPassword): User email data to send reset password link.
        db (AsyncSession): Database session. Defaults to Depends(get_db).

    Raises:
        HTTPException: Raises 500 if sending email fails due to server error.

    Returns:
        schemas.ResetTokenResponse: Contains the reset token sent to the user.
    """
    try:
        return await crud.send_mail(data=data, db=db)
    except InvalidCredentials as e:
        raise HTTPException(
            status_code=404, detail=f"Failed to send mail to user : {e}")
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to send mail to user.")


@router.post('/reset-password', response_model=schemas.MessageResponse, description="Reset your password!")
async def reset_password(data: schemas.ChangePassword, db: AsyncSession = Depends(get_db)):
    """
    To reset the password of a registered user.

    Args:
        data (schemas.ChangePassword): takes the reset token along with the new password.
        db (AsyncSession): Database Session . Defaults to Depends(get_db).

    Raises:
        HTTPException: Password Pattern - if password pattern is invalid.

    Returns:
        schemas.MessageResponse : Returns confirmation message that password is changed.
    """
    try:
        return await crud.reset_pass(data=data, db=db)
    except InvalidCredentials as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except PasswordPattern as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to change password.")


@router.post("/auth/verify-master-password")
async def verify_master_password(
    data: schemas.MasterPasswordVerifyRequest
):
    user_email = data.email

    user = await crud.get_user_by_email(user_email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ver = utils.verify_password(data.masterPassword, user.hashed_password)

    if ver:
        return {"valid": True}
    else:
        return {"valid": False}
