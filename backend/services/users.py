# services/users.py
import os
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import random
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
                    SELECT user_id, full_name, about_me, birthday, profile_pic
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

                # Get username from security table
                username_query = text(
                    """
                    SELECT username
                    FROM profile.security
                    WHERE user_id = :user_id
                """
                )
                username_result = db.execute(
                    username_query, {"user_id": user_dict["user_id"]}
                ).first()

                if username_result:
                    user_dict["username"] = username_result._mapping["username"]
                else:
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
                SELECT user_id, email, username
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
                    SELECT user_id, full_name, about_me, birthday, profile_pic
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

    @staticmethod
    def create_user(db: Session, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user with all required records"""
        try:
            print(f"Creating new user with email: {user_data.get('email')}")

            # Generate a random user_id between 1 and 999999
            user_id = random.randint(1, 999999)

            # Check if the generated ID already exists to avoid collisions
            id_check_query = text(
                """
                SELECT EXISTS (SELECT 1 FROM profile.security WHERE user_id = :user_id)
            """
            )

            # Keep generating IDs until we find one that doesn't exist
            id_exists = True
            while id_exists:
                user_id = random.randint(1, 999999)
                result = db.execute(id_check_query, {"user_id": user_id}).scalar()
                id_exists = result

            # Start a transaction
            transaction = db.begin_nested()

            try:
                # Create security entry with the generated user_id
                security_query = text(
                    """
                    INSERT INTO profile.security 
                    (user_id, username, email, password_hash) 
                    VALUES (:user_id, :username, :email, :password_hash)
                    RETURNING user_id, username, email
                """
                )

                security_params = {
                    "user_id": user_id,
                    "username": user_data.get("username"),
                    "email": user_data.get("email"),
                    "password_hash": UserService.get_password_hash(
                        user_data.get("password")
                    ),
                }

                result = db.execute(security_query, security_params).first()

                if not result:
                    raise Exception("Failed to create security record")

                # Create user profile
                users_query = text(
                    """
                    INSERT INTO profile.users 
                    (user_id, username, full_name, about_me, birthday) 
                    VALUES (:user_id, :username, :full_name, :about_me, :birthday)
                """
                )

                users_params = {
                    "user_id": user_id,
                    "username": user_data.get("username"),
                    "full_name": f"{user_data.get('first_name')} {user_data.get('last_name')}",
                    "about_me": None,
                    "birthday": None,
                }

                db.execute(users_query, users_params)

                # Create user_stats record
                stats_query = text(
                    """
                    INSERT INTO profile.user_stats (user_id)
                    VALUES (:user_id)
                """
                )

                db.execute(stats_query, {"user_id": user_id})

                # Create user_badges record
                badges_query = text(
                    """
                    INSERT INTO profile.user_badges (user_id)
                    VALUES (:user_id)
                """
                )

                db.execute(badges_query, {"user_id": user_id})

                # Prepare the response
                new_user = {
                    "id": user_id,
                    "email": user_data.get("email"),
                    "username": user_data.get("username"),
                    "first_name": user_data.get("first_name"),
                    "last_name": user_data.get("last_name"),
                    "is_active": True,
                    "role": "user",
                }

                # Commit the transaction
                transaction.commit()

                # Commit to the database
                db.commit()

                print(f"Successfully created user with ID: {user_id}")
                return new_user

            except Exception as e:
                transaction.rollback()
                raise e

        except Exception as e:
            db.rollback()
            print(f"Error in create_user: {str(e)}")
            raise e
