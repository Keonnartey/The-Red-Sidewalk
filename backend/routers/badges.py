from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db  # your DB dependency
from typing import Dict, Any

router = APIRouter()

@router.get("/badges")
def get_user_badges(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Retrieve badge statuses for a given user.
    For now, we're using a hardcoded user_id (1). In production, you would extract this
    from the user's session or token.
    """
    query = text("""
       SELECT 
         bigfoot_amateur,
         lets_be_friends,
         elite_hunter,
         socialite,
         diversify,
         well_traveled,
         hallucinator,
         camera_ready,
         dragon_rider
       FROM profile.user_badges_real
       WHERE user_id = :user_id
    """)
    result = db.execute(query, {"user_id": user_id})
    row = result.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User badges not found")
    return dict(row._mapping)


@router.get("/profile")
def get_user_profile(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Retrieve user profile information.
    For now, we're using a hardcoded user_id (1). In production, you would extract this
    from the user's session or token.
    """
    query = text("""
       SELECT 
         user_id,
         full_name,
         user_address,
         about_me,
         birthday,
         profile_pic
       FROM profile.users
       WHERE user_id = :user_id
    """)
    result = db.execute(query, {"user_id": user_id})
    row = result.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    return dict(row._mapping)

@router.get("/stats")
def get_user_stats(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Retrieve user stats.
    For now, we're using a hardcoded user_id (1). In production, you would extract this
    from the user's session or token.
    """
    query = text("""
       SELECT 
        user_id,
        unique_creature_count,
        total_sightings_count,
        bigfoot_count,
        dragon_count,
        ghost_count,
        alien_count,
        vampire_count,
        total_friends,
        comments_count,
        like_count,
        pictures_count,
        locations_count,
        user_avg_rating
       FROM profile.user_stats
       WHERE user_id = :user_id
    """)
    result = db.execute(query, {"user_id": user_id})
    row = result.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="User stats not found")
    return dict(row._mapping)
