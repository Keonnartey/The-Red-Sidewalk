import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException, status
from typing import Optional
from config import PROFILE_PICS_DIR, ALLOWED_PROFILE_PIC_EXTENSIONS, MAX_UPLOAD_SIZE


def save_profile_picture(profile_pic: UploadFile) -> Optional[str]:
    """
    Save a profile picture to the filesystem

    Args:
        profile_pic: FastAPI UploadFile object

    Returns:
        str: Relative path to the saved file

    Raises:
        HTTPException: If file is invalid or too large
    """
    try:
        # Check if file is empty
        if not profile_pic.filename:
            return None

        # Check file extension
        file_ext = os.path.splitext(profile_pic.filename)[1].lower()
        if file_ext not in ALLOWED_PROFILE_PIC_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format. Allowed formats: {', '.join(ALLOWED_PROFILE_PIC_EXTENSIONS)}",
            )

        # Check file size - read into memory first to check, with a size limit
        file_contents = profile_pic.file.read(MAX_UPLOAD_SIZE + 1)
        if len(file_contents) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File is too large. Maximum size: {MAX_UPLOAD_SIZE / (1024 * 1024)}MB",
            )

        # Reset file pointer
        profile_pic.file.seek(0)

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(PROFILE_PICS_DIR, unique_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            # Write the contents that we already read
            buffer.write(file_contents)

        # Return a relative path to the file for storage in the database
        return f"/uploads/profile_pics/{unique_filename}"

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}",
        )
