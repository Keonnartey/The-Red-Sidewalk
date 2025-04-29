# services/accounts.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
from passlib.hash import bcrypt  # For password hashing
import random  # Add this import


def create_account(db: Session, body: Dict[str, Any]):
    try:
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
            # Insert into security table with the generated user_id
            security_stmt = text(
                """
                INSERT INTO profile.security (
                    user_id,
                    username,
                    email,
                    password_hash
                )
                VALUES (
                    :user_id,
                    :username,
                    :email,
                    :password_hash
                )
                RETURNING user_id
            """
            )

            # Hash the password
            hashed_password = bcrypt.hash(body["password"])

            db.execute(
                security_stmt,
                {
                    "user_id": user_id,
                    "username": body["username"],
                    "email": body["email"],
                    "password_hash": hashed_password,
                },
            )

            # Insert into users table
            users_stmt = text(
                """
                INSERT INTO profile.users (
                    user_id,
                    username,
                    full_name,
                    about_me,
                    birthday
                )
                VALUES (
                    :user_id,
                    :username,
                    :full_name,
                    :about_me,
                    :birthday
                )
            """
            )

            db.execute(
                users_stmt,
                {
                    "user_id": user_id,
                    "username": body["username"],
                    "full_name": f"{body['first_name']} {body['last_name']}",
                    "about_me": body.get("about_me"),
                    "birthday": body.get("birthday"),
                },
            )

            # Initialize user_badges
            badges_stmt = text(
                """
                INSERT INTO profile.user_badges (
                    user_id
                )
                VALUES (
                    :user_id
                )
            """
            )

            db.execute(badges_stmt, {"user_id": user_id})

            # Initialize user_stats
            stats_stmt = text(
                """
                INSERT INTO profile.user_stats (
                    user_id
                )
                VALUES (
                    :user_id
                )
            """
            )

            db.execute(stats_stmt, {"user_id": user_id})

            # Commit the nested transaction
            transaction.commit()

            # Commit to the database
            db.commit()

            return user_id

        except Exception as e:
            transaction.rollback()
            raise e

    except Exception as e:
        db.rollback()
        raise e
