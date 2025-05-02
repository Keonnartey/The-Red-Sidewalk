# backend/routers/friends.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

def get_user_id(request: Request) -> int:
    uid = request.headers.get("x-user-id")
    if not uid:
        raise HTTPException(status_code=401, detail="Missing user ID")
    try:
        return int(uid)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

@router.get("")
def list_friends(request: Request, db: Session = Depends(get_db)):
    """
    Return a list of friend IDs for the current user.
    """
    user_id = get_user_id(request)
    stmt = text("""
        SELECT friend_id
        FROM profile.social
        WHERE user_id = :uid
    """)
    rows = db.execute(stmt, {"uid": user_id}).fetchall()
    return [r[0] for r in rows]

@router.post("/{friend_id}")
def toggle_friend(friend_id: int, request: Request, db: Session = Depends(get_db)): 
    """
    Add or remove a friend. Cannot add yourself.
    If already friends, this will unfriend; otherwise it will add.
    """
    user_id = get_user_id(request)

    if friend_id == user_id:
        raise HTTPException(status_code=400, detail="Can't friend yourself")

    # Check existing relationship
    exists = db.execute(
        text(
            """
        SELECT 1
        FROM profile.social
        WHERE user_id = :uid
          AND friend_id = :fid
    """), {"uid": user_id, "fid": friend_id}).fetchone()

    if exists:
        # Unfriend
        db.execute(
            text(
                """
            DELETE FROM profile.social
            WHERE user_id = :uid
              AND friend_id = :fid
        """), {"uid": user_id, "fid": friend_id})
        action = "removed"
    else:
        # Add friend
        db.execute(
            text(
                """
            INSERT INTO profile.social (user_id, friend_id)
            VALUES (:uid, :fid)
            ON CONFLICT DO NOTHING
        """), {"uid": user_id, "fid": friend_id})
        action = "added"

    db.commit()
    return {"status": "success", "action": action, "friend_id": friend_id}
