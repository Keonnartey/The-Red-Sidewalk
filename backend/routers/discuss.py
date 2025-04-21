from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, Dict, Any
from database import get_db  # Your DB session dependency

router = APIRouter()

# Define the creature mapping
creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
    5: "vampire",
}

# Create an inverted mapping for filtering: creature name -> creature_id
creature_name_to_id = {v: k for k, v in creature_types.items()}

@router.get("/posts")
def get_posts(
    db: Session = Depends(get_db),
    creature: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    """
    Retrieve a list of posts, optionally filtered by creature and location.
    Each "post" corresponds to a row in info.sightings_preview joined to profile.users.
    We also fetch aggregated up/down votes from social.interactions.
    Creature filtering is applied using a mapping dictionary.
    """

    base_query = """
        SELECT
            s.sighting_id AS post_id,
            s.user_id,
            s.creature_id,
            s.location_name AS location,
            s.description_short AS content,
            s.created_at AS time_posted,
            'User ' || CAST(u.user_id AS TEXT) AS username,
            (SELECT SUM(i.upvote_count)
             FROM info.sightings_full i
             WHERE i.sighting_id = s.sighting_id) AS upvotes,
            (SELECT SUM(i.downvote_count)
             FROM info.sightings_full i
             WHERE i.sighting_id = s.sighting_id) AS downvotes
        FROM info.sightings_preview s
        LEFT JOIN profile.users u ON s.user_id = u.user_id
        WHERE 1=1
    """

    params: Dict[str, Any] = {}

    if creature:
        creature = creature.lower()
        creature_id = creature_name_to_id.get(creature)
        if creature_id is None:
            raise HTTPException(status_code=400, detail="Invalid creature filter")
        base_query += " AND s.creature_id = :creature_id"
        params["creature_id"] = creature_id

    if location:
        base_query += " AND LOWER(s.location_name) LIKE '%' || LOWER(:location) || '%'"
        params["location"] = location


    base_query += " ORDER BY s.created_at DESC;"

    stmt = text(base_query)
    result = db.execute(stmt, params)
    rows = result.fetchall()

    posts = []
    for row in rows:
        row_dict = dict(row._mapping)
        # Add creature_name based on the creature_types mapping.
        row_dict["creature_name"] = creature_types.get(row_dict["creature_id"], "Unknown")
        row_dict["comments"] = []  # We'll attach comments below.
        posts.append(row_dict)

    post_ids = [p["post_id"] for p in posts]
    if post_ids:
        comments_query = text("""
            SELECT
                i.sighting_id AS post_id,
                i.comment_id,
                i.user_id,
                i.comment,
                f.upvote_count,
                f.downvote_count,
                'User ' || CAST(u.user_id AS TEXT) AS username
            FROM social.interactions i
            JOIN info.sightings_full f ON i.sighting_id = f.sighting_id
            LEFT JOIN profile.users u ON i.user_id = u.user_id
            WHERE i.sighting_id = ANY(:post_ids)
            ORDER BY i.comment_id ASC
        """)
        comments_result = db.execute(comments_query, {"post_ids": post_ids})
        comments_rows = comments_result.fetchall()

        comments_map = {}
        for cr in comments_rows:
            cr_dict = dict(cr._mapping)
            pid = cr_dict["post_id"]
            if pid not in comments_map:
                comments_map[pid] = []
            comments_map[pid].append(cr_dict)

        for p in posts:
            p["comments"] = comments_map.get(p["post_id"], [])

    return posts

@router.post("/posts/{post_id}/comment")
def add_comment(
    post_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Add a new comment to a post.
    For testing, we force the user_id to 1.
    Payload example:
    {
      "comment": "This is awesome!",
      "upvote_count": 0,
      "downvote_count": 0
    }
    """
    stmt = text("""
        INSERT INTO social.interactions (
            comment_id, sighting_id, user_id, comment
        )
        VALUES (
            (SELECT COALESCE(MAX(comment_id), 0) + 1 FROM social.interactions),
            :sighting_id,
            :user_id,
            :comment
        )
    """)
    db.execute(stmt, {
        "sighting_id": post_id,
        "user_id": 1,  # Forced user id for testing.
        "comment": payload["comment"]
    })

    # Insert the votes
    stmt_votes = text("""
        INSERT INTO info.sightings_full (
            sighting_id, user_id, upvote_count, downvote_count
        )
        VALUES (
            :sighting_id,
            :user_id,
            :upvote_count,
            :downvote_count
        )
        ON CONFLICT (sighting_id) DO UPDATE SET
            upvote_count = EXCLUDED.upvote_count,
            downvote_count = EXCLUDED.downvote_count
    """)
    db.execute(stmt_votes, {
        "sighting_id": post_id,
        "user_id": 1,
        "upvote_count": payload.get("upvote_count", 0),
        "downvote_count": payload.get("downvote_count", 0)
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
    Increase upvote count for a post.
    For testing, assume user_id 1 is upvoting.
    Payload example:
    { "amount": 1 }
    """
    increment = payload.get("amount", 1)
    
    # Try to update an existing vote row for user 100 where comment is NULL/empty
    update_stmt = text("""
        UPDATE info.sightings_full
        SET upvote_count = upvote_count + :increment
        WHERE sighting_id = :sighting_id
                AND user_id = 1
    """)
    result = db.execute(update_stmt, {"increment": increment, "sighting_id": post_id})
    
    # If no row was updated (user hasn't voted yet), insert a new vote row.
    if result.rowcount == 0:
        insert_stmt = text("""
            INSERT INTO info.sightings_full (
                sighting_id, user_id, upvote_count, downvote_count
            )
            VALUES (
                :sighting_id,
                1,
                :upvote_count,
                0
            )
        """)
        db.execute(insert_stmt, {"sighting_id": post_id, "upvote_count": increment})
    
    db.commit()
    return {"status": "success", "message": "Post upvoted"}


@router.post("/posts/{post_id}/downvote")
def downvote_post(
    post_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Increase downvote count for a post.
    For testing, assume user_id 1 is downvoting.
    Payload example:
    { "amount": 1 }
    """
    increment = payload.get("amount", 1)
    
    update_stmt = text("""
        UPDATE info.sightings_full
        SET downvote_count = downvote_count + :increment
        WHERE sighting_id = :sighting_id
            AND user_id = 1
    """)
    result = db.execute(update_stmt, {"increment": increment, "sighting_id": post_id})
    
    if result.rowcount == 0:
        insert_stmt = text("""
            INSERT INTO info.sightings_full (
                sighting_id, user_id, upvote_count, downvote_count
            )
            VALUES (
                :sighting_id,
                1,
                0,
                :downvote_count
            )
        """)
        db.execute(insert_stmt, {"sighting_id": post_id, "downvote_count": increment})
    
    db.commit()
    return {"status": "success", "message": "Post downvoted"}
