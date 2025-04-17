from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text

router = APIRouter()

@router.get("/{user_id}/{sighting_id}")
def get_user_rating(user_id: int, sighting_id: int, db: Session = Depends(get_db)):
    stmt = text("""
        SELECT rating
        FROM social.ratings
        WHERE user_id = :user_id AND sighting_id = :sighting_id
    """)
    result = db.execute(stmt, {"user_id": user_id, "sighting_id": sighting_id}).fetchone()
    if result:
        return {"rating": result[0]}
    return {"rating": None}
