from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class RatingInput(BaseModel):
    sighting_id: int
    user_id: int
    rating: int

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

@router.post("/")
def submit_user_rating(body: RatingInput, db: Session = Depends(get_db)):
    if not (1 <= body.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Upsert: insert or update if it exists
    stmt = text("""
        INSERT INTO social.ratings (sighting_id, user_id, rating, created_at)
        VALUES (:sighting_id, :user_id, :rating, :created_at)
        ON CONFLICT (sighting_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating, created_at = EXCLUDED.created_at
    """)

    db.execute(stmt, {
        "sighting_id": body.sighting_id,
        "user_id": body.user_id,
        "rating": body.rating,
        "created_at": datetime.utcnow()
    })

    db.commit()

    return {"status": "success", "rating": body.rating}
