from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/public/{user_id}")
def get_public_profile(user_id: int, db: Session = Depends(get_db)):
    # 1) basic user info
    row = db.execute(text("""
        SELECT user_id, full_name, about_me, profile_pic
        FROM profile.users
        WHERE user_id = :uid
    """), {"uid": user_id}).fetchone()
    if not row:
        raise HTTPException(404, "User not found")
    user = dict(row._mapping)

    # 2) badges (default all false if missing)
    badge_row = db.execute(text("""
        SELECT *
        FROM profile.user_badges_real
        WHERE user_id = :uid
    """), {"uid": user_id}).fetchone()
    badge_defaults = {
      "bigfoot_amateur": False,
      "lets_be_friends": False,
      "elite_hunter": False,
      "socialite": False,
      "diversify": False,
      "well_traveled": False,
      "hallucinator": False,
      "camera_ready": False,
      "dragon_rider": False
    }
    badges = badge_defaults if not badge_row else dict(badge_row._mapping)

    # 3) stats (empty if missing)
    stats_row = db.execute(text("""
        SELECT *
        FROM profile.user_stats
        WHERE user_id = :uid
    """), {"uid": user_id}).fetchone()
    stats = {} if not stats_row else dict(stats_row._mapping)

    # 4) their sightings
    sight_rows = db.execute(text("""
        SELECT
          sighting_id,
          creature_id,
          location_name AS location,
          description_short AS content,
          created_at    AS time_posted
        FROM info.sightings_preview
        WHERE user_id = :uid
        ORDER BY created_at DESC
    """), {"uid": user_id}).fetchall()
    sightings = [dict(r._mapping) for r in sight_rows]

    return {
      "user": user,
      "badges": badges,
      "stats": stats,
      "sightings": sightings
    }
