from core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import timezone, datetime, timedelta


class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False,
                        default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    reset_tokens = relationship("PasswordToken", back_populates="user")
    passwords = relationship("Password", back_populates="user", cascade="all, delete-orphan")
    verified = Column(Boolean, nullable=False, default=False)


class Otp(Base):
    __tablename__ = "otp_tokens"

    id = Column(Integer, primary_key=True, index=True)
    otp = Column(String, nullable=False)
    expiration_time = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc) + timedelta(minutes=5))
    used = Column(Boolean, default=False)
    email = Column(String, nullable=False)


class PasswordToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expiration_time = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc) + timedelta(minutes=30))
    used = Column(Boolean, default=False)
    user = relationship("User", back_populates="reset_tokens")
