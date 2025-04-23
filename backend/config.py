import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Base settings
BASE_DIR = Path(__file__).resolve().parent

# Upload directories
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PROFILE_PICS_DIR = os.path.join(UPLOAD_DIR, "profile_pics")

# Security settings
SECRET_KEY = os.getenv(
    "SECRET_KEY", "your_default_secret_key_here_for_development_only"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")
)  # Default 1 week

# Create required directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)

# Database settings
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# Build database URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Allowed file extensions
ALLOWED_PROFILE_PIC_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"]
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
