import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=40,
                          )

    @field_validator('password')
    def validate_password(cls, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$#!%*?&]{8,}$'
        if not re.match(pattern, value):
            raise ValueError("Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
        return value


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")
    password: str = Field(..., min_length=8, max_length=40)


class ForgotPassword(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")


class ChangePassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=40,
                              )

    @field_validator('new_password')
    def validate_new_password(cls, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$#!%*?&]{8,}$'
        if not re.match(pattern, value):
            raise ValueError("New password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
        return value


class Token(BaseModel):
    access_token: str
    type: str


class MasterPasswordVerifyRequest(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")
    masterPassword: str = Field(..., min_length=8, max_length=40,
                                description="Master password for verification")


class VerifyPass(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")
    otp: str
    new_password: str = Field(..., min_length=8, max_length=40,
                              )

    @field_validator('new_password')
    def validate_new_password(cls, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$#!%*?&]{8,}$'
        if not re.match(pattern, value):
            raise ValueError("New password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
        return value


class ResetTokenResponse(BaseModel):
    reset_token: str
    message: str


class MessageResponse(BaseModel):
    message: str


class OtpVerify(BaseModel):
    email: EmailStr = Field(..., description="Give a valid email address")
    otp: str = Field(..., min_length=6, max_length=6, description="Enter the 6-digit OTP sent to your email")


class Refresh(BaseModel):
    refresh_token: str


class UserOut(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
