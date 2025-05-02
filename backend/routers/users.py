from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import timedelta, date
import jwt
from jwt.exceptions import PyJWTError
from sqlalchemy.orm import Session
from sqlalchemy import text

from services.users import UserService
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db
from pydantic import validator

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/token")


# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    username: str = Field(..., min_length=3, max_length=50)
    security_question: str  # Changed to required
    security_answer: str  # Changed to required
    about_me: Optional[str] = None
    birthday: Optional[date] = None
    hometown_city: Optional[str] = None
    hometown_state: Optional[str] = None
    hometown_country: Optional[str] = None

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


class PasswordResetRequest(BaseModel):
    email: EmailStr


class SecurityQuestionResponse(BaseModel):
    security_question: str
    username: str


class SecurityAnswerVerify(BaseModel):
    email: EmailStr
    username: str
    answer: str


class PasswordReset(BaseModel):
    email: EmailStr
    username: str
    answer: str
    new_password: str = Field(..., min_length=8)


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

        # Ensure security question and answer are provided
        if not user_data.security_question or not user_data.security_answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security question and answer are required",
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
    first_name: str = Form(...),
    last_name: str = Form(...),
    about_me: Optional[str] = Form(None),
    birthday: Optional[str] = Form(None),
    hometown_city: Optional[str] = Form(None),
    hometown_state: Optional[str] = Form(None),
    hometown_country: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Create or update user profile"""
    try:
        print(f"Profile update request for user_id: {user_id}")
        if profile_pic:
            print(f"Profile picture included: {profile_pic.filename}")

        # Check if user exists
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare profile data
        profile_data = {
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            # Remove full_name as it's generated automatically
        }

        if about_me is not None:  # Use is not None to allow empty string
            profile_data["about_me"] = about_me

        if birthday:
            profile_data["birthday"] = birthday

        # Add hometown fields
        if hometown_city:
            profile_data["hometown_city"] = hometown_city

        if hometown_state:
            profile_data["hometown_state"] = hometown_state

        if hometown_country:
            profile_data["hometown_country"] = hometown_country

        # Handle profile picture upload
        if profile_pic and profile_pic.filename:
            print(f"Processing profile picture: {profile_pic.filename}")
            from utils.file_utils import save_profile_picture

            profile_pic_path = save_profile_picture(profile_pic)
            if profile_pic_path:
                profile_data["profile_pic"] = profile_pic_path
                print(f"Profile picture path saved: {profile_pic_path}")
            else:
                print("Failed to save profile picture")

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

            for field in [
                "first_name",
                "last_name",
                # Remove full_name from this list
                "about_me",
                "birthday",
                "hometown_city",
                "hometown_state",
                "hometown_country",
                "profile_pic",
            ]:
                if field in profile_data:
                    update_fields.append(f"{field} = :{field}")
                    update_params[field] = profile_data[field]

            if update_fields:
                update_query = text(
                    f"""
                    UPDATE profile.users 
                    SET {", ".join(update_fields)}
                    WHERE user_id = :user_id
                    RETURNING user_id, first_name, last_name, about_me, birthday, profile_pic, 
                              hometown_city, hometown_state, hometown_country
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
            # Create new profile with all fields
            fields = []
            values = []
            params = {}

            for field, value in profile_data.items():
                fields.append(field)
                values.append(f":{field}")
                params[field] = value

            insert_query = text(
                f"""
                INSERT INTO profile.users 
                ({", ".join(fields)}) 
                VALUES ({", ".join(values)})
                RETURNING user_id, first_name, last_name, about_me, birthday, profile_pic,
                          hometown_city, hometown_state, hometown_country
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
            import traceback

            traceback.print_exc()
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


class PublicUser(BaseModel):
    user_id: int
    full_name: str
    profile_pic: Optional[str] = None
    hometown_city: Optional[str] = None
    hometown_state: Optional[str] = None
    hometown_country: Optional[str] = None


@router.get(
    "/public/{user_id}",
    response_model=PublicUser,
    summary="Public profile lookup (no auth)",
)
def get_user_public(user_id: int, db: Session = Depends(get_db)):
    """
    Return minimal public info for any user_id:
    - Uses profile.security as the driver table (so IDs always exist)
    - Left-joins into profile.users if you've actually inserted a row there
    - Falls back to 'User <id>' for full_name if no row in profile.users
    """
    stmt = text(
        """
        SELECT 
            s.user_id,
            COALESCE(u.full_name, 'User ' || s.user_id::text) AS full_name,
            u.profile_pic,
            u.hometown_city,
            u.hometown_state, 
            u.hometown_country
        FROM profile.security AS s
        LEFT JOIN profile.users AS u
          ON s.user_id = u.user_id
        WHERE s.user_id = :uid
    """
    )
    row = db.execute(stmt, {"uid": user_id}).fetchone()
    if not row:
        # truly does not exist even in security
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return dict(row._mapping)


@router.post("/forgot-password", response_model=SecurityQuestionResponse)
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Get security question for a user's email"""
    try:
        # Find the user by email
        query = text(
            """
            SELECT user_id, username, security_question 
            FROM profile.security 
            WHERE email = :email
        """
        )
        result = db.execute(query, {"email": request.email}).first()

        if not result:
            # Don't reveal whether an email exists or not for security
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="If this email exists, a security question has been sent",
            )

        return {
            "security_question": result.security_question,
            "username": result.username,
        }
    except Exception as e:
        if not isinstance(e, HTTPException):
            print(f"Error in forgot_password: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing password reset request",
            )
        raise e


# Step 2: Verify security answer
# Add these changes to your verify-security-answer endpoint
@router.post("/verify-security-answer")
async def verify_security_answer(
    request: SecurityAnswerVerify, db: Session = Depends(get_db)
):
    """Verify the security answer provided by the user"""
    try:
        print(f"Verifying security answer for: {request.username}")
        print(f"Request data: {request.dict()}")  # Print the entire request data

        # Find user and get their security answer
        query = text(
            """
            SELECT user_id, security_answer 
            FROM profile.security 
            WHERE email = :email AND username = :username
        """
        )

        query_params = {"email": request.email, "username": request.username}
        print(f"Query parameters: {query_params}")

        result = db.execute(query, query_params).first()

        if not result:
            print(
                f"No user found with email: {request.email} and username: {request.username}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # For debugging - REMOVE IN PRODUCTION!
        print(f"DB user_id: {result.user_id}")
        print(f"Stored answer: '{result.security_answer}'")
        print(f"Provided answer: '{request.answer}'")

        # Case-insensitive comparison
        stored_answer = result.security_answer.lower() if result.security_answer else ""
        provided_answer = request.answer.lower() if request.answer else ""

        print(f"Lowercase comparison: '{stored_answer}' vs '{provided_answer}'")
        print(f"Answers match? {stored_answer == provided_answer}")

        if stored_answer != provided_answer:
            print(f"Incorrect security answer provided")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect security answer",
            )

        print(f"Security answer verified for user: {request.username}")

        # Generate a temporary token for this reset request
        reset_token = UserService.create_access_token(
            data={"sub": str(result.user_id), "reset": True},
            expires_delta=timedelta(minutes=15),  # Short expiration time for security
        )

        return {"reset_token": reset_token}
    except Exception as e:
        print(f"Error in verify_security_answer endpoint: {str(e)}")
        if not isinstance(e, HTTPException):
            import traceback

            traceback.print_exc()  # Print full stack trace
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error verifying security answer: {str(e)}",
            )
        raise e


# Step 3: Reset password
@router.post("/reset-password")
async def reset_password(request: PasswordReset, db: Session = Depends(get_db)):
    """Reset a user's password after verifying identity with security question"""
    try:
        # Find the user by email and username
        query = text(
            """
            SELECT user_id, security_answer 
            FROM profile.security 
            WHERE email = :email AND username = :username
        """
        )
        result = db.execute(
            query, {"email": request.email, "username": request.username}
        ).first()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Verify the security answer
        if result.security_answer.lower() != request.answer.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect security answer",
            )

        # Update the password
        update_query = text(
            """
            UPDATE profile.security 
            SET password_hash = :password_hash 
            WHERE user_id = :user_id
        """
        )

        db.execute(
            update_query,
            {
                "user_id": result.user_id,
                "password_hash": UserService.get_password_hash(request.new_password),
            },
        )

        db.commit()

        return {"message": "Password reset successful"}
    except Exception as e:
        db.rollback()
        if not isinstance(e, HTTPException):
            print(f"Error in reset_password: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error resetting password",
            )
        raise e
