from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# Build database URL
DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Create engine (connection pool)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,           # Optional: tune as needed
    max_overflow=10,
)

# Create sessionmaker instance
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Optional: Base class for declarative models
Base = declarative_base()

# Dependency for getting DB session (to inject into routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
