import os
import requests
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter()

# ─── Creature mappings ─────────────────────────────────────────────────────────
creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
    5: "vampire",
}
creature_name_to_id = {v: k for k, v in creature_types.items()}

# ─── Presign endpoint ──────────────────────────────────────────────────────────
LAMBDA_URL = os.getenv("LAMBDA_GET_PRESIGN_ENDPOINT", "").rstrip("/")
if not LAMBDA_URL:
    raise RuntimeError("Missing LAMBDA_GET_PRESIGN_ENDPOINT environment variable")

def generate_presigned_urls(s3_keys: List[str]) -> List[str]:
    """
    For each key, POST to your Lambda URL and collect the signed URL.
    Expects the lambda to return JSON { "url": "<signed_url>" } on 200.
    """
    signed: List[str] = []
    for key in s3_keys:
        resp = requests.post(LAMBDA_URL, json={"key": key})
        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Presign lambda failed for {key}: {resp.status_code} {resp.text}"
            )
        signed.append(resp.json()["url"])
    return signed


@router.get("/posts")
def get_posts(
    request: Request,
    db: Session = Depends(get_db),
    creature: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
):
    """
    Fetch posts + comments + presigned image URLs via your Lambda endpoint.
    """
    # 1) Main posts
    sql = """
        SELECT
            s.sighting_id       AS post_id,
            s.user_id,
            s.creature_id,
            s.location_name     AS location,
            s.description_short AS content,
            s.created_at        AS time_posted,
            COALESCE(f.upvote_count, 0)   AS upvotes,
            COALESCE(f.downvote_count, 0) AS downvotes,
            COALESCE(u.full_name, 'User '||CAST(s.user_id AS TEXT)) AS username
        FROM info.sightings_preview s
        LEFT JOIN info.sightings_full f ON s.sighting_id = f.sighting_id
        LEFT JOIN profile.users      u ON s.user_id      = u.user_id
        WHERE 1=1
    """
    params: Dict[str, Any] = {}
    if creature:
        cid = creature_name_to_id.get(creature.lower())
        if cid is None:
            raise HTTPException(400, "Invalid creature filter")
        sql += " AND s.creature_id = :creature_id"
        params["creature_id"] = cid
    if location:
        sql += " AND LOWER(s.location_name) LIKE '%'||LOWER(:location)||'%'"
        params["location"] = location
    sql += " ORDER BY s.created_at DESC;"

    rows = db.execute(text(sql), params).fetchall()
    posts: List[Dict[str, Any]] = []
    for r in rows:
        d = dict(r._mapping)
        d["creature_name"] = creature_types.get(d["creature_id"], "unknown")
        d["comments"] = []
        d["images"] = []
        posts.append(d)

    post_ids = [p["post_id"] for p in posts]
    if not post_ids:
        return posts

    # 2) Comments
    comments_sql = text("""
        SELECT
            i.sighting_id AS post_id,
            i.comment_id,
            i.user_id,
            i.comment,
            f.upvote_count,
            f.downvote_count,
            COALESCE(u.full_name, 'User '||CAST(i.user_id AS TEXT)) AS username
        FROM social.interactions i
        LEFT JOIN info.sightings_full f ON i.sighting_id = f.sighting_id
        LEFT JOIN profile.users      u ON i.user_id        = u.user_id
        WHERE i.sighting_id = ANY(:post_ids)
        ORDER BY i.comment_id
    """)
    cr = db.execute(comments_sql, {"post_ids": post_ids}).fetchall()
    cmap: Dict[int, List[Dict[str, Any]]] = {}
    for r in cr:
        m = dict(r._mapping)
        cmap.setdefault(m["post_id"], []).append(m)
    for p in posts:
        p["comments"] = cmap.get(p["post_id"], [])

    # 3) Image keys → presigned URLs
    keys_sql = text("""
        SELECT sighting_id AS post_id, img_url
        FROM info.sightings_imgs
        WHERE sighting_id = ANY(:post_ids)
        ORDER BY img_id
    """)
    kr = db.execute(keys_sql, {"post_ids": post_ids}).fetchall()
    keys_map: Dict[int, List[str]] = {}
    for r in kr:
        pid = r._mapping["post_id"]
        key = r._mapping["img_url"]
        keys_map.setdefault(pid, []).append(key)

    # Generate signed URLs per post
    for p in posts:
        keys = keys_map.get(p["post_id"], [])
        if keys:
            p["images"] = generate_presigned_urls(keys)
        else:
            p["images"] = []

    return posts


@router.post("/posts/{post_id}/comment")
def add_comment(
    post_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Add a comment without touching upvote/downvote counts.
    """
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(400, detail="Missing user_id in request body")

    stmt = text("""
        INSERT INTO social.interactions (
            comment_id, sighting_id, user_id, comment
        )
        VALUES (
            (SELECT COALESCE(MAX(comment_id), 0) + 1 FROM social.interactions),
            :post_id,
            :user_id,
            :comment
        )
    """)
    db.execute(stmt, {
        "post_id": post_id,
        "user_id": user_id,
        "comment": payload["comment"]
    })

    db.commit()
    return {"status": "success", "message": "Comment added"}


@router.post("/posts/{post_id}/upvote")
def upvote_post(
    post_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Allow a user to like a post exactly once.
    """
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(400, detail="Missing user_id in request body")

    # 1) Has this user already upvoted?
    check = db.execute(text("""
        SELECT 1
        FROM info.sightings_full
        WHERE sighting_id = :post_id
          AND user_id     = :user_id
          AND upvote_count > 0
    """), {"post_id": post_id, "user_id": user_id}).fetchone()

    if check:
        return {"status": "already upvoted", "message": "You can only like once"}

    # 2) Not yet upvoted: insert or update
    inc = payload.get("amount", 1)
    result = db.execute(text("""
        UPDATE info.sightings_full
        SET upvote_count = upvote_count + :inc
        WHERE sighting_id = :post_id
          AND user_id     = :user_id
    """), {"inc": inc, "post_id": post_id, "user_id": user_id})

    if result.rowcount == 0:
        db.execute(text("""
            INSERT INTO info.sightings_full (
                sighting_id, user_id, upvote_count, downvote_count
            ) VALUES (
                :post_id, :user_id, :inc, 0
            )
        """), {"post_id": post_id, "user_id": user_id, "inc": inc})

    db.commit()
    return {"status": "success", "message": "Post upvoted"}


@router.post("/posts/{post_id}/downvote")
def downvote_post(
    post_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Allow a user to downvote a post once.
    """
    increment = payload.get("amount", 1)
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(400, detail="Missing user_id in request body")

    update_stmt = text("""
        UPDATE info.sightings_full
        SET downvote_count = downvote_count + :increment
        WHERE sighting_id = :sighting_id
          AND user_id     = :user_id
    """)
    result = db.execute(update_stmt, {
        "increment": increment,
        "sighting_id": post_id,
        "user_id": user_id
    })

    if result.rowcount == 0:
        insert_stmt = text("""
            INSERT INTO info.sightings_full (
                sighting_id, user_id, upvote_count, downvote_count
            )
            VALUES (
                :sighting_id,
                :user_id,
                0,
                :downvote_count
            )
        """)
        db.execute(insert_stmt, {
            "sighting_id": post_id,
            "user_id": user_id,
            "downvote_count": increment
        })

    db.commit()
    return {"status": "success", "message": "Post downvoted"}
