from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import timedelta
import jwt
from jwt.exceptions import PyJWTError
from sqlalchemy.orm import Session
from sqlalchemy import text

from services.users import UserService
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/token")


# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    username: str
    security_question: Optional[str] = None
    security_answer: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = "User"
    last_name: Optional[str] = "Name"
    username: Optional[str] = None
    is_active: bool = True
    role: str = "user"


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Authentication functions
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get the current authenticated user from the JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id))
    except PyJWTError:
        raise credentials_exception

    user = UserService.get_user_by_id(db, token_data.user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Check if the current user is active"""
    if not current_user.get("is_active"):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# API routes
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Login and get JWT token"""
    print(f"Login attempt for: {form_data.username}")
    user = UserService.authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = UserService.create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if email already exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Check if username is taken
        username_query = text(
            """
            SELECT user_id FROM profile.security WHERE username = :username
        """
        )
        username_check = db.execute(
            username_query, {"username": user_data.username}
        ).first()

        if username_check:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

        # Create new user
        new_user = UserService.create_user(db, user_data.dict())
        return new_user
    except Exception as e:
        if not isinstance(e, HTTPException):
            print(f"Error in register_user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}",
            )
        raise e


@router.post("/profile")
async def create_user_profile(
    user_id: int = Form(...),
    full_name: str = Form(...),
    about_me: Optional[str] = Form(None),
    birthday: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Create or update user profile"""
    try:
        # Check if user exists
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare profile data
        profile_data = {
            "user_id": user_id,
            "full_name": full_name,
        }

        if about_me:
            profile_data["about_me"] = about_me

        if birthday:
            profile_data["birthday"] = birthday

        # Handle profile picture upload
        if profile_pic:
            from utils.file_utils import save_profile_picture

            profile_pic_path = save_profile_picture(profile_pic)
            if profile_pic_path:
                profile_data["profile_pic"] = profile_pic_path

        # Check if profile already exists
        check_profile_query = text(
            """
            SELECT user_id FROM profile.users WHERE user_id = :user_id
        """
        )
        existing_profile = db.execute(check_profile_query, {"user_id": user_id}).first()

        if existing_profile:
            # Update existing profile
            update_fields = []
            update_params = {"user_id": user_id}

            if full_name:
                update_fields.append("full_name = :full_name")
                update_params["full_name"] = full_name

            if about_me:
                update_fields.append("about_me = :about_me")
                update_params["about_me"] = about_me

            if birthday:
                update_fields.append("birthday = :birthday")
                update_params["birthday"] = birthday

            if profile_pic:
                update_fields.append("profile_pic = :profile_pic")
                update_params["profile_pic"] = profile_data["profile_pic"]

            if update_fields:
                update_query = text(
                    f"""
                    UPDATE profile.users 
                    SET {", ".join(update_fields)}
                    WHERE user_id = :user_id
                    RETURNING user_id, full_name, about_me, birthday, profile_pic
                """
                )

                result = db.execute(update_query, update_params).first()
                db.commit()

                # Convert result to dict
                profile_result = {}
                for key in result._mapping.keys():
                    profile_result[key] = result._mapping[key]

                return profile_result
        else:
            # Create new profile
            fields = ["user_id", "full_name"]
            values = [":user_id", ":full_name"]
            params = {"user_id": user_id, "full_name": full_name}

            if about_me:
                fields.append("about_me")
                values.append(":about_me")
                params["about_me"] = about_me

            if birthday:
                fields.append("birthday")
                values.append(":birthday")
                params["birthday"] = birthday

            if profile_pic:
                fields.append("profile_pic")
                values.append(":profile_pic")
                params["profile_pic"] = profile_data["profile_pic"]

            insert_query = text(
                f"""
                INSERT INTO profile.users 
                ({", ".join(fields)}) 
                VALUES ({", ".join(values)})
                RETURNING user_id, full_name, about_me, birthday, profile_pic
            """
            )

            result = db.execute(insert_query, params).first()
            db.commit()

            # Convert result to dict
            profile_result = {}
            for key in result._mapping.keys():
                profile_result[key] = result._mapping[key]

            return profile_result

    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            print(f"Error in create_user_profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating profile: {str(e)}",
            )
        raise e


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
):
    """Get current user information"""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific user by ID (requires authentication)"""
    # Check if user has permission (admin or the user themselves)
    if current_user.get("role") != "admin" and current_user.get("id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user
