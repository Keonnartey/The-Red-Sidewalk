from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import timedelta
import jwt
from jwt.exceptions import PyJWTError
from sqlalchemy.orm import Session
from sqlalchemy import text

from services.users import (
    UserService,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
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
    # Check if email already exists
    existing_user = UserService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    new_user = UserService.create_user(db, user_data.dict())
    return new_user


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

class PublicUser(BaseModel):
    user_id: int
    full_name: str
    profile_pic: Optional[str] = None

@router.get(
    "/public/{user_id}", 
    response_model=PublicUser,
    summary="Public profile lookup (no auth)",
)
def get_user_public(user_id: int, db: Session = Depends(get_db)):
    """
    Return minimal public info for any user_id:
    - Uses profile.security as the driver table (so IDs always exist)
    - Left-joins into profile.users if you’ve actually inserted a row there
    - Falls back to 'User <id>' for full_name if no row in profile.users
    """
    stmt = text("""
        SELECT 
            s.user_id,
            COALESCE(u.full_name, 'User ' || s.user_id::text) AS full_name,
            u.profile_pic
        FROM profile.security AS s
        LEFT JOIN profile.users AS u
          ON s.user_id = u.user_id
        WHERE s.user_id = :uid
    """)
    row = db.execute(stmt, {"uid": user_id}).fetchone()
    if not row:
        # truly does not exist even in security
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return dict(row._mapping)