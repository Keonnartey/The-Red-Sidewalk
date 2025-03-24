from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow Next.js dev or other services to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be more specific in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Healthcheck endpoint to confirm DB connection
@app.get("/")
def read_root():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return {"message": "Database is connected and working!"}
    except Exception as e:
        return {"error": f"Database connection failed: {str(e)}"}
