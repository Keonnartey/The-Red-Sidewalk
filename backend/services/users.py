import os
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your_default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class UserService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email address"""
        try:
            print(f"Looking up user with email: {email}")

            # Directly query the security table since we only need user_id for auth
            query = text(
                """
                SELECT user_id, email, password_hash, failed_attempts
                FROM profile.security
                WHERE email = :email
            """
            )
            result = db.execute(query, {"email": email}).first()

            if not result:
                print(f"No user found with email: {email}")
                return None

            # Convert row to dict
            user_dict = {}
            for key in result._mapping.keys():
                user_dict[key] = result._mapping[key]

            # Add id field which is expected by the auth logic
            user_dict["id"] = user_dict["user_id"]

            # Try to get additional user information if available
            try:
                user_query = text(
                    """
                    SELECT user_id, full_name, user_address, about_me, birthday, profile_pic
                    FROM profile.users
                    WHERE user_id = :user_id
                """
                )
                user_result = db.execute(
                    user_query, {"user_id": user_dict["user_id"]}
                ).first()

                if user_result:
                    # Add user details to the dict
                    for key in user_result._mapping.keys():
                        if key != "user_id":  # Skip user_id since we already have it
                            user_dict[key] = user_result._mapping[key]

                    # Add expected fields for compatibility
                    name_parts = user_dict.get("full_name", "User Name").split(" ", 1)
                    user_dict["first_name"] = name_parts[0]
                    user_dict["last_name"] = (
                        name_parts[1] if len(name_parts) > 1 else ""
                    )
                    user_dict["username"] = email.split("@")[0]
            except Exception as e:
                print(f"Error getting user details: {str(e)}")

            # Add required fields that the code expects
            user_dict["is_active"] = True
            user_dict["role"] = "user"

            print(f"User found: {user_dict}")
            return user_dict

        except Exception as e:
            print(f"Error in get_user_by_email: {str(e)}")
            return None

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        try:
            print(f"Looking up user with ID: {user_id}")

            # Start with security table for email
            security_query = text(
                """
                SELECT user_id, email
                FROM profile.security
                WHERE user_id = :user_id
            """
            )
            security_result = db.execute(security_query, {"user_id": user_id}).first()

            if not security_result:
                print(f"No security record found for user ID: {user_id}")
                return None

            # Convert row to dict
            user_dict = {}
            for key in security_result._mapping.keys():
                user_dict[key] = security_result._mapping[key]

            # Add id field
            user_dict["id"] = user_dict["user_id"]

            # Try to get user details
            try:
                user_query = text(
                    """
                    SELECT user_id, full_name, user_address, about_me, birthday, profile_pic
                    FROM profile.users
                    WHERE user_id = :user_id
                """
                )
                user_result = db.execute(user_query, {"user_id": user_id}).first()

                if user_result:
                    # Add user details to the dict
                    for key in user_result._mapping.keys():
                        if key != "user_id":  # Skip user_id since we already have it
                            user_dict[key] = user_result._mapping[key]

                    # Add expected fields for compatibility
                    name_parts = user_dict.get("full_name", "User Name").split(" ", 1)
                    user_dict["first_name"] = name_parts[0]
                    user_dict["last_name"] = (
                        name_parts[1] if len(name_parts) > 1 else ""
                    )
                    user_dict["username"] = user_dict["email"].split("@")[0]
            except Exception as e:
                print(f"Error getting user details: {str(e)}")

            # Add required fields that the code expects
            user_dict["is_active"] = True
            user_dict["role"] = "user"

            print(f"User found by ID: {user_dict}")
            return user_dict

        except Exception as e:
            print(f"Error in get_user_by_id: {str(e)}")
            return None

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        try:
            print(f"Verifying password (hashed stored as: {hashed_password[:20]}...)")
            result = pwd_context.verify(plain_password, hashed_password)
            print(f"Password verification result: {result}")
            return result
        except Exception as e:
            print(f"Error verifying password: {str(e)}")
            return False

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    @staticmethod
    def update_last_login(db: Session, user_id: int) -> None:
        """Update last login timestamp"""
        try:
            query = text(
                """
                UPDATE profile.security 
                SET last_login = CURRENT_TIMESTAMP 
                WHERE user_id = :user_id
            """
            )
            db.execute(query, {"user_id": user_id})
            db.commit()
            print(f"Updated last login for user ID: {user_id}")
        except Exception as e:
            print(f"Error updating last login: {str(e)}")
            db.rollback()

    @staticmethod
    def increment_failed_attempts(db: Session, user_id: int) -> None:
        """Increment failed login attempts"""
        try:
            query = text(
                """
                UPDATE profile.security 
                SET failed_attempts = failed_attempts + 1 
                WHERE user_id = :user_id
            """
            )
            db.execute(query, {"user_id": user_id})
            db.commit()
            print(f"Incremented failed attempts for user ID: {user_id}")
        except Exception as e:
            print(f"Error incrementing failed attempts: {str(e)}")
            db.rollback()

    @staticmethod
    def reset_failed_attempts(db: Session, user_id: int) -> None:
        """Reset failed login attempts"""
        try:
            query = text(
                """
                UPDATE profile.security 
                SET failed_attempts = 0 
                WHERE user_id = :user_id
            """
            )
            db.execute(query, {"user_id": user_id})
            db.commit()
            print(f"Reset failed attempts for user ID: {user_id}")
        except Exception as e:
            print(f"Error resetting failed attempts: {str(e)}")
            db.rollback()

    @staticmethod
    def create_access_token(
        data: Dict[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT token for authentication"""
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def authenticate_user(
        db: Session, email: str, password: str
    ) -> Optional[Dict[str, Any]]:
        """Authenticate a user with email and password"""
        try:
            print(f"Attempting to authenticate user: {email}")
            user = UserService.get_user_by_email(db, email)

            if not user:
                print(f"Authentication failed: User not found")
                return None

            if not UserService.verify_password(password, user["password_hash"]):
                print(f"Authentication failed: Invalid password")
                UserService.increment_failed_attempts(db, user["id"])
                return None

            # Reset failed attempts and update last login
            UserService.reset_failed_attempts(db, user["id"])
            UserService.update_last_login(db, user["id"])

            # Remove password_hash from result
            user.pop("password_hash", None)
            print(f"Authentication successful for: {email}")
            return user

        except Exception as e:
            print(f"Error in authenticate_user: {str(e)}")
            return None
