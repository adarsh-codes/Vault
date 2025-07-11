from core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import timezone, datetime
from auth.models import User


class Password(Base):
    __tablename__ = "passwords"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    website = Column(String, nullable=False)
    username = Column(String, nullable=False)
    encrypted_password = Column(String, nullable=False)
    iv = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    user = relationship("User", back_populates="passwords")
