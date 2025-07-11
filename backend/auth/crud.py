from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.responses import JSONResponse
from . import utils
from . import models
from . import schemas
from core.logging_config import logger
from core.custom_exceptions import UserAlreadyExists, InvalidCredentials
from . import email_service
from .otp_generator import generate_otp
from .otp_mail import send_otp_email


async def request_otp(email: schemas.UserBase, db: AsyncSession) -> schemas.MessageResponse:
    """
    Request an OTP for the given email address.

    Args:
        email (schemas.Email): The email address to send the OTP to.
        db (AsyncSession): The database session.

    Raises:
        InvalidCredentials: If the email is not registered.

    Returns:
        schemas.MessageResponse: A message indicating that the OTP has been sent.
    """
    logger.info(f"[REQUEST_OTP] OTP requested for {email}")

    otp = generate_otp()
    send_otp_email(email=email, otp=otp)

    # Store OTP in the database
    otp_entry = models.Otp(otp=otp, email=email)
    db.add(otp_entry)
    await db.commit()

    return {"message": "OTP sent successfully!"}


async def verify_otp(data: schemas.OtpVerify, db: AsyncSession) -> schemas.MessageResponse:
    """
    Verify the OTP sent to the user's email.

    Args:
        data (schemas.OtpVerification): Contains the email and OTP to verify.
        db (AsyncSession): The database session.

    Raises:
        InvalidCredentials: If the OTP is invalid or expired.

    Returns:
        schemas.MessageResponse: A message indicating whether the OTP verification was successful.
    """
    logger.info(f"[VERIFY_OTP] Verifying OTP for {data.email}")
    result = await db.execute(select(models.Otp).where(models.Otp.otp == data.otp, models.Otp.email == data.email))
    otp_entry = result.scalar_one_or_none()

    if not otp_entry or otp_entry.used or otp_entry.expiration_time < utils.get_current_time():
        raise InvalidCredentials("Invalid or expired OTP.")

    otp_entry.used = True
    db.add(otp_entry)
    await db.commit()

    return {"message": "OTP verified successfully!"}


async def verify_update_pass(data: schemas.VerifyPass, db: AsyncSession) -> schemas.MessageResponse:
    logger.info(
        f"[VERIFY_UPDATE_PASS] Verifying OTP and updating password for {data.email}")

    # 1. Check if user exists
    user = await get_user_by_email(db, data.email)
    if not user:
        raise InvalidCredentials("Email not registered.")

    # 2. Verify OTP (assuming you have an Otp model with code, email, expires_at, used)
    try:
        query = select(models.Otp).where(
            models.Otp.email == data.email,
            models.Otp.otp == data.otp,
            models.Otp.used == False,
            models.Otp.expiration_time > utils.get_current_time()
        )
        result = await db.execute(query)
        otp_record = result.scalar_one_or_none()
    except Exception:
        raise InvalidCredentials("Invalid or expired OTP.")
    # 3. Update password (hash it before saving)
    hashed_password = utils.hash_password(data.new_password)
    user.password = hashed_password

    # 4. Mark OTP as used
    otp_record.used = True

    # 5. Commit transaction
    await db.commit()

    return {"message": "Password updated successfully!"}


async def get_user_by_email(db: AsyncSession, email: str) -> models.User:
    """
    Fetches user from the DB using email.

    Args:
        db (AsyncSession): DB session.
        email (str): email input.

    Returns:
        models.User: Returns a User from the User table.
    """
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user: schemas.UserCreate) -> schemas.UserOut:
    """
    Creates a new user in the User table.

    Args:
        db (AsyncSession): DB session.
        user (schemas.UserCreate): Input request.

    Raises:
        UserAlreadyExists: If the email id already exists in the User table.

    Returns:
        schemas.UserOut: The user output schema.
    """
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise UserAlreadyExists(f"Email {user.email} already exists.")

    logger.info(f"[CREATE_USER] Creating user: {user.email}")

    hashed_pw = utils.hash_password(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_pw,
        verified=True
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def login(db: AsyncSession, user: schemas.UserLogin) -> JSONResponse:
    """
    Check user login details and provide bearer token.

    Args:
        db (AsyncSession): DB session.
        user (schemas.UserLogin): Take email and password.

    Raises:
        InvalidCredentials: If entered password is wrong or user doesn't exist.

    Returns:
        schemas.Token: Tokens for accessing the protected routes.
    """
    logger.info(f"Login requested by {user.email}")
    existing_user = await get_user_by_email(db, user.email)
    if not existing_user or not utils.verify_password(user.password, existing_user.hashed_password):
        raise InvalidCredentials(
            "Invalid Credentials! Please check the details input.")

    access_token = utils.create_access_token({"sub": user.email})
    refresh_token = utils.create_refresh_token({"sub": user.email})
    logger.info(f"Login Successful by {user.email}")

    response = JSONResponse(content={
        "message": "Login successful",
        "access_token": access_token
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )

    return response


async def store_reset_token(user_id: int, token: str, db: AsyncSession) -> None:
    pass_db = models.PasswordToken(user_id=user_id, token=token, used=False)
    db.add(pass_db)
    await db.commit()
    await db.refresh(pass_db)


async def reset_pass(data: dict, db: AsyncSession) -> schemas.MessageResponse:
    """
    Reset the user password.

    Args:
        data (dict): Takes token and new password as input.
        db (AsyncSession): _description_

    Returns:
        schemas.MessageResponse: Confirmation message.
    """
    payload = utils.decode_token(data.token)

    if payload is None:
        raise InvalidCredentials("Invalid or expired token.")

    email = payload["sub"]

    result = await db.execute(select(models.PasswordToken).where(models.PasswordToken.token == data.token))
    reset_entry = result.scalar_one_or_none()
    if not reset_entry:
        raise InvalidCredentials("Reset token not found.")

    if reset_entry.used:
        raise InvalidCredentials("Token already used.")

    res = await db.execute(select(models.User).where(models.User.email == email))
    user = res.scalar_one_or_none()
    if not user:
        raise InvalidCredentials("User not found.")

    user.hashed_password = utils.hash_password(data.new_password)
    reset_entry.used = True
    db.add(user)
    db.add(reset_entry)
    await db.commit()
    return {"message": "Password changed successfully!"}


async def send_mail(data: dict, db: AsyncSession) -> schemas.ResetTokenResponse:
    """
    Sends a reset password link to user mail.

    Args:
        data (dict): takes the email of the user as input.
        db (AsyncSession): DB session.

    Returns:
        schemas.ResetTokenResponse: Sends back the reset token and a confirmation message.
    """
    res_token = utils.reset_token({"sub": data.email})
    user = await get_user_by_email(db=db, email=data.email)
    if not user:
        raise InvalidCredentials("User not found!")
    email_service.send_reset_email(to_email=data.email, token=res_token)
    await store_reset_token(user_id=user.id, token=res_token, db=db)
    return {"reset_token": res_token, "message": "Reset token stored In DB."}
