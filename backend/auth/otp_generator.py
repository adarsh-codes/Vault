import random


def generate_otp(length=6) -> str:
    """Generate a numeric OTP of given length (default: 6 digits)."""
    if length <= 0:
        raise ValueError("OTP length must be greater than 0")
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])
