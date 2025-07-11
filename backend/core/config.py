from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    URL: str
    SMTP_SERVER: str
    SMTP_PORT: int
    EMAIL_FROM: str
    SMTP_PASSWORD: str

    class Config:
        env_file = ".env"


settings = Settings()
