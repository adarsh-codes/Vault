from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings


DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL)

AsyncSessionLocal = sessionmaker(class_=AsyncSession, expire_on_commit=False, bind=engine)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
