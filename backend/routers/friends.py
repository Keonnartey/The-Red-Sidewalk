# backend/routers/friends.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

# 👤 In real life pull this from your auth layer!
CURRENT_USER_ID = 1

@router.get("")
def list_friends(db: Session = Depends(get_db)):
    """
    Return a list of friend IDs for the current user.
    """
    stmt = text("""
        SELECT friend_id
        FROM profile.social
        WHERE user_id = :uid
    """)
    rows = db.execute(stmt, {"uid": CURRENT_USER_ID}).fetchall()
    return [r[0] for r in rows]


@router.post("/{friend_id}")
def toggle_friend(friend_id: int, db: Session = Depends(get_db)):
    """
    Add or remove a friend. Cannot add yourself.
    If already friends, this will un‐friend; otherwise it will add.
    """
    if friend_id == CURRENT_USER_ID:
        raise HTTPException(status_code=400, detail="Can't friend yourself")

    # Check existing relationship
    exists = db.execute(text("""
        SELECT 1
        FROM profile.social
        WHERE user_id = :uid
          AND friend_id = :fid
    """), {"uid": CURRENT_USER_ID, "fid": friend_id}).fetchone()

    if exists:
        # Unfriend
        db.execute(text("""
            DELETE FROM profile.social
            WHERE user_id = :uid
              AND friend_id = :fid
        """), {"uid": CURRENT_USER_ID, "fid": friend_id})
        action = "removed"
    else:
        # Add friend
        db.execute(text("""
            INSERT INTO profile.social (user_id, friend_id)
            VALUES (:uid, :fid)
            ON CONFLICT DO NOTHING
        """), {"uid": CURRENT_USER_ID, "fid": friend_id})
        action = "added"

    db.commit()
    return {"status": "success", "action": action, "friend_id": friend_id}
