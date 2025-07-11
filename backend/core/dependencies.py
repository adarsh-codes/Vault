from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from sqlalchemy import select
from auth import models
from auth import utils
from .database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/signin")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = utils.decode_token(token)
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = await db.execute(select(models.User).where(models.User.email == payload.get("sub")))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=404, detail="Invalid Token.")
