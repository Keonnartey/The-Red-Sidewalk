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
