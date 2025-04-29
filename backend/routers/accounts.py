# routers/accounts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from services import accounts as accounts_service
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date


# Define request model with validation
class CreateAccountRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    about_me: Optional[str] = None
    birthday: Optional[date] = None
    security_question: Optional[str] = None
    security_answer: Optional[str] = None

    @validator("username")
    def validate_username(cls, v):
        if not all(c.isalnum() or c == "_" for c in v):
            raise ValueError(
                "Username must contain only letters, numbers, and underscores"
            )
        return v

    @validator("birthday")
    def validate_birthday(cls, v):
        if v is not None:
            # Ensure user is at least 13 years old
            today = date.today()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 13:
                raise ValueError("User must be at least 13 years old")
        return v


router = APIRouter()


@router.post("/register")
def create_account(request: CreateAccountRequest, db: Session = Depends(get_db)):
    try:
        # Convert pydantic model to dict
        body = request.dict()

        # Check if username already exists
        username_check = text(
            "SELECT EXISTS(SELECT 1 FROM profile.security WHERE username = :username)"
        )
        username_exists = db.execute(
            username_check, {"username": body["username"]}
        ).scalar_one()

        if username_exists:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Check if email already exists
        email_check = text(
            "SELECT EXISTS(SELECT 1 FROM profile.security WHERE email = :email)"
        )
        email_exists = db.execute(email_check, {"email": body["email"]}).scalar_one()

        if email_exists:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Create account
        user_id = accounts_service.create_account(db, body)

        # Return format expected by frontend
        return {"id": user_id}
    except ValueError as e:
        # Validation error
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        # Log the error here
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the account: {str(e)}",
        )
