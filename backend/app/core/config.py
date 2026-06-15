from dotenv import load_dotenv
import os

load_dotenv()

DAtABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@pafstore.pk")

# App URLs
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# EasyPaisa merchant credentials
EASYPAISA_STORE_ID = os.getenv("EASYPAISA_STORE_ID", "")
EASYPAISA_HASH_KEY = os.getenv("EASYPAISA_HASH_KEY", "")
