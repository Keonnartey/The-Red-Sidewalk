# backend/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PublicProfile(BaseModel):
    user: dict
    badges: dict
    stats: dict
    sightings: list[dict]


router = APIRouter()


@router.get("/public/{user_id}", response_model=PublicProfile)
def get_public_profile(user_id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching profile for user_id: {user_id}")

    try:
        # Validate user_id
        if not user_id or user_id <= 0:
            logger.error(f"Invalid user_id: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID provided",
            )

        # 1) Fetch complete user data from both security and users tables
        logger.info("Querying user data")
        user_row = db.execute(
            text(
                """
            SELECT 
              s.user_id,
              s.username,
              s.email,
              u.full_name,
              u.about_me,
              u.hometown_city,
              u.hometown_state,
              u.hometown_country,
              u.birthday,
              u.created_at,
              u.profile_pic
            FROM profile.security AS s
            LEFT JOIN profile.users AS u
              ON s.user_id = u.user_id
            WHERE s.user_id = :uid
        """
            ),
            {"uid": user_id},
        ).fetchone()

        if not user_row:
            # No such user even in security table
            logger.error(f"User not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Convert row to dict for response
        user_dict = dict(user_row._mapping)

        # Apply default values for null fields
        if user_dict["full_name"] is None:
            user_dict["full_name"] = f"User {user_id}"
        if user_dict["about_me"] is None:
            user_dict["about_me"] = ""

        logger.info(f"User data retrieved: {user_dict}")

        # 2) Fetch badges
        logger.info("Querying badges")
        badges_row = db.execute(
            text(
                """
            SELECT * FROM profile.user_badges_real
            WHERE user_id = :uid
        """
            ),
            {"uid": user_id},
        ).fetchone()

        badges = dict(badges_row._mapping) if badges_row else {"user_id": user_id}
        logger.info(f"Badges retrieved: {badges}")

        # 3) Fetch stats
        logger.info("Querying stats")
        stats_row = db.execute(
            text(
                """
            SELECT * FROM profile.user_stats
            WHERE user_id = :uid
        """
            ),
            {"uid": user_id},
        ).fetchone()

        stats = (
            dict(stats_row._mapping)
            if stats_row
            else {
                "user_id": user_id,
                "total_sightings_count": 0,
                "total_friends": 0,
                "unique_creature_count": 0,
                "comments_count": 0,
                "bigfoot_count": 0,
                "like_count": 0,
                "dragon_count": 0,
                "pictures_count": 0,
                "ghost_count": 0,
                "locations_count": 0,
                "alien_count": 0,
                "vampire_count": 0,
                "user_avg_rating": 0,
            }
        )
        logger.info(f"Stats retrieved: {stats}")

        # 4) Fetch sightings
        logger.info("Querying sightings")
        rows = db.execute(
            text(
                """
            SELECT
              sighting_id,
              creature_id,
              description_short AS content,
              sighting_date AS time_posted,
              location_name AS location
            FROM info.sightings_preview
            WHERE user_id = :uid
            ORDER BY sighting_date DESC
        """
            ),
            {"uid": user_id},
        ).fetchall()

        sightings = [dict(r._mapping) for r in rows]
        logger.info(f"Sightings retrieved: {len(sightings)}")

        # Return complete profile data
        return {
            "user": user_dict,
            "badges": badges,
            "stats": stats,
            "sightings": sightings,
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log any other errors and return a generic error
        logger.error(
            f"Error fetching profile for user {user_id}: {str(e)}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user profile: {str(e)}",
        )
