# Updated utils/file_utils.py
import os
import uuid
import logging
from fastapi import UploadFile
import shutil
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Define the uploads directory - ensure this directory exists
UPLOAD_DIR = Path("static/uploads/profile_pictures")


def save_profile_picture(profile_pic: UploadFile) -> str:
    """
    Save an uploaded profile picture and return the file path
    """
    if not profile_pic or not profile_pic.filename:
        return None

    try:
        # Create the upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Get file extension while keeping the original
        file_extension = os.path.splitext(profile_pic.filename)[1].lower()

        # Validate file extension to ensure it's an image
        valid_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
        if file_extension not in valid_extensions:
            print(f"Invalid file extension: {file_extension}")
            return None

        # Generate a unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename

        # Log the full file system path for debugging
        print(f"Saving file to filesystem path: {file_path.absolute()}")

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_pic.file, buffer)

        # Reset file pointer
        profile_pic.file.seek(0)

        # Important: Return the correct web-accessible path matching how you mounted static files
        # Since you mounted both /static and /uploads, let's use the /uploads path for clarity
        relative_path = f"/uploads/profile_pictures/{unique_filename}"
        print(f"URL path that will be saved to database: {relative_path}")
        return relative_path

    except Exception as e:
        print(f"Error saving profile picture: {str(e)}")
        return None
