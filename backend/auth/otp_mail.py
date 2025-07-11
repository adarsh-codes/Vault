import smtplib
from core.config import settings


def send_otp_email(email, otp) -> None:
    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.EMAIL_FROM, settings.SMTP_PASSWORD)
        message = f"Subject: Verification OTP\n\nEnter the following OTP to verify your email: {otp}"
        server.sendmail(settings.EMAIL_FROM, email, message)
