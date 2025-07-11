from pydantic import BaseModel, ConfigDict


class PasswordCreate(BaseModel):
    website: str
    username: str
    encrypted_password: str
    iv: str
    salt: str


class PasswordOut(BaseModel):
    id: int
    website: str
    username: str
    encrypted_password: str
    iv: str
    salt: str


class Message(BaseModel):
    message: str

    model_config = ConfigDict(from_attributes=True)
