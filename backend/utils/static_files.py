from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os


def setup_static_files(app: FastAPI):
    """Configure static file serving for uploads"""

    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Mount the uploads directory
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

    return app
