from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/profile")
def get_user_profile(
    user_id: int = Query(..., description="User ID from session/client"),
    db: Session = Depends(get_db)
):
    query = text("""
       SELECT 
         user_id,
         username
       FROM profile.users
       WHERE user_id = :user_id
    """)
    row = db.execute(query, {"user_id": user_id}).fetchone()
    if not row:
        raise HTTPException(404, "User profile not found")
    return dict(row._mapping)

@router.get("/badges")
def get_user_badges(
    user_id: int = Query(..., description="User ID from session/client"),
    db: Session = Depends(get_db)
):
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
    row = db.execute(query, {"user_id": user_id}).fetchone()
    if not row:
        raise HTTPException(404, "User badges not found")
    return dict(row._mapping)

@router.get("/stats")
def get_user_stats(
    user_id: int = Query(..., description="User ID from session/client"),
    db: Session = Depends(get_db)
):
    query = text("""
       SELECT 
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
    row = db.execute(query, {"user_id": user_id}).fetchone()
    if not row:
        raise HTTPException(404, "User stats not found")
    return dict(row._mapping)
