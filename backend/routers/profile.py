# backend/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel

class PublicProfile(BaseModel):
    user: dict
    badges: dict
    stats: dict
    sightings: list[dict]

router = APIRouter()

@router.get("/public/{user_id}", response_model=PublicProfile)
def get_public_profile(user_id: int, db: Session = Depends(get_db)):
    # 1) drive off profile.security, left-join into profile.users
    user_row = db.execute(text("""
        SELECT 
          s.user_id,
          COALESCE(u.full_name, 'User ' || s.user_id::text) AS full_name,
          COALESCE(u.about_me, '')              AS about_me,
          u.profile_pic
        FROM profile.security AS s
        LEFT JOIN profile.users   AS u
          ON s.user_id = u.user_id
        WHERE s.user_id = :uid
    """), {"uid": user_id}).fetchone()

    if not user_row:
        # truly no such user even in security
        raise HTTPException(404, "User not found")

    # 2) badges
    badges_row = db.execute(text("""
        SELECT * FROM profile.user_badges_real
        WHERE user_id = :uid
    """), {"uid": user_id}).fetchone()
    badges = dict(badges_row._mapping) if badges_row else {}

    # 3) stats
    stats_row = db.execute(text("""
        SELECT * FROM profile.user_stats
        WHERE user_id = :uid
    """), {"uid": user_id}).fetchone()
    stats = dict(stats_row._mapping) if stats_row else {}

    # 4) sightings
    rows = db.execute(text("""
        SELECT
          sighting_id,
          creature_id,
          description_short AS content,
          sighting_date      AS time_posted,
          location_name      AS location
        FROM info.sightings_preview
        WHERE user_id = :uid
        ORDER BY sighting_date DESC
    """), {"uid": user_id}).fetchall()
    sightings = [dict(r._mapping) for r in rows]

    return {
        "user": dict(user_row._mapping),
        "badges": badges,
        "stats": stats,
        "sightings": sightings
    }
