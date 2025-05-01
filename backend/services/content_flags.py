from sqlalchemy.orm import Session
from sqlalchemy import text
import logging
from datetime import datetime


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_flag(
        db:Session,
        content_id: int, 
        user_id: int, 
        reason: str,
        content_type: str,
        custom_reason: str = None
):
    """
    
    :param db: Database session
    :param content_id: ID of the content being flagged
    :param user_id: ID of the user who flagged it
    :param reason: Reason code (e.g., 'spam', 'offensive')
    :param content_type: Type of content ('comment' or 'sighting')
    :param custom_reason: Optional free-text explanation
    :return: Dictionary with inserted flag info
    """

    created_at = datetime.utcnow()

    insert_sql = text("""
            INSERT INTO social.content_flags (
                content_id,
                content_type,
                flagged_by_user_id,
                reason_code,
                custom_reason,
                status,
                reviewed_by_admin_id,
                created_at
            )
            VALUES (
                :content_id,
                :content_type,
                :flagged_by_user_id,
                :reason_code,
                :custom_reason,
                'pending',
                NULL,
                :created_at
            )
            RETURNING *
        """)
    
    result = db.execute(insert_sql, {
        "content_id": content_id,
        "content_type": content_type,
        "flagged_by_user_id": user_id,
        "reason_code": reason,
        "custom_reason": custom_reason,
        "created_at": created_at
    })

    db.commit()

    row = result.fetchone()
    return {
        "content_id": row.content_id,
        "content_type": row.content_type,
        "flagged_by_user_id": row.flagged_by_user_id,
        "reason_code": row.reason_code,
        "custom_reason": row.custom_reason,
        "status": row.status,
        "reviewed_by_admin_id": row.reviewed_by_admin_id,
        "created_at": row.created_at.isoformat() if row.created_at else None
    }


def get_all_flags(
        db:Session
):
    """
    Retrieve all flagged content (comments and sightings)
    
    :param db: Database session
    :return: A list of all flagged content
    """
    
    sql = text("""
            SELECT 
                content_id,
                content_type,
                flagged_by_user_id,
                reason_code,
                custom_reason,
                status,
                reviewed_by_admin_id,
                created_at
            FROM social.content_flags
        """)

    result = db.execute(sql)
    rows = result.fetchall()

    return [
            {
                "content_id": row.content_id,
                "content_type": row.content_type,
                "flagged_by_user_id": row.flagged_by_user_id,
                "reason_code": row.reason_code,
                "custom_reason": row.custom_reason,
                "status": row.status,
                "reviewed_by_admin_id": row.reviewed_by_admin_id,
                "created_at": row.created_at.isoformat() if row.created_at else None
            }
            for row in rows
        ]

def get_hidden_content_ids(db: Session):
    sql = text("""
        SELECT content_id
        FROM social.content_flags
        WHERE content_type = 'sighting'
        GROUP BY content_id
        HAVING COUNT(*) >= 3
    """)
    result = db.execute(sql)
    rows = result.fetchall()
    return [row.content_id for row in rows]

def get_flagged_sightings_for_admin(db: Session):
    sql = text("""
        SELECT 
            cf.content_id,
            s.location_name,
            s.description_short,
            COUNT(cf.content_id) AS flag_count
        FROM social.content_flags cf
        JOIN info.sightings_preview s
            ON cf.content_id = s.sighting_id
        WHERE cf.content_type = 'sighting'
        GROUP BY cf.content_id, s.location_name, s.description_short
        HAVING COUNT(cf.content_id) >= 3
        ORDER BY flag_count DESC
    """)
    result = db.execute(sql).fetchall()

    return [
        {
            "sighting_id": row.content_id,
            "location_name": row.location_name,
            "description": row.description_short,
            "flag_count": row.flag_count
        }
        for row in result
    ]