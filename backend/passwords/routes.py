from fastapi import APIRouter, HTTPException
from . import schemas
from core.database import get_db
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from passwords import models
from core.dependencies import get_current_user
from sqlalchemy import select


router = APIRouter(prefix="/passwords", tags=["Password Fetch Routes"])


@router.post("/add-password", response_model=schemas.Message)
async def add_password(data: schemas.PasswordCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """
    Route to add a new password.
    """
    new_password = models.Password(
        website=data.website,
        username=data.username,
        encrypted_password=data.encrypted_password,
        iv=data.iv,
        salt=data.salt
    )
    new_password.user_id = user.id
    db.add(new_password)
    await db.commit()
    await db.refresh(new_password)
    return {"message": "Password added successfully."}


@router.get("/get-passwords", response_model=list[schemas.PasswordOut])
async def get_passwords(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    """
    Route to get all passwords for the current user.
    """
    query = select(models.Password).where(models.Password.user_id == user.id)
    passwords = await db.execute(query)
    return passwords.scalars().all()


@router.put("/{id}", response_model=schemas.Message)
async def update_password(
    id: int,
    payload: schemas.PasswordCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    query = select(models.Password).where(models.Password.id == id, models.Password.user_id == user.id)
    result = await db.execute(query)
    password = result.scalar_one_or_none()
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")

    password.website = payload.website
    password.username = payload.username
    password.encrypted_password = payload.encrypted_password
    password.iv = payload.iv
    password.salt = payload.salt

    await db.commit()
    await db.refresh(password)
    return {"message": "Password updated successfully."}


@router.delete("/{id}", response_model=schemas.Message)
async def delete_password(
    id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    query = select(models.Password).where(models.Password.id == id, models.Password.user_id == user.id)
    result = await db.execute(query)
    password = result.scalar_one_or_none()

    if not password:
        raise HTTPException(status_code=404, detail="Password not found")

    await db.delete(password)
    await db.commit()

    return {"message": "Password deleted"}
