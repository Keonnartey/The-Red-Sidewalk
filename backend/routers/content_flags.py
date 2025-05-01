from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel
from services import content_flags as content_flags_service
from typing import Dict, Any, Optional

router = APIRouter()

class FlagCreateRequest(BaseModel):
    content_id: int
    user_id: int
    reason: str
    content_type: str
    custom_reason: Optional[str] = None

@router.post("/flags")
def create_content_flag(
    flag_data: FlagCreateRequest,
    db: Session = Depends(get_db)
):

    """
    Create a new content flag.

    :param comment_id: ID of the content being flagged (can be a comment or sighting)
    :param user_id: ID of the user who is flagging the content
    :param reason: Reason for flagging the content
    :param db: Database session
    :return: The created content flag details
    """

    try:
        return content_flags_service.create_flag(
            db=db,
            content_id=flag_data.content_id,
            user_id=flag_data.user_id,
            reason=flag_data.reason,
            content_type=flag_data.content_type,
            custom_reason=flag_data.custom_reason
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flags")
def get_all_flags(
    db:Session = Depends(get_db)
):
    """
    Retrieve all flagged content (sightings and comments)
    
    :param db: Database session
    :return: A list of all flagged content
    """
    try:
        return content_flags_service.get_all_flags(db)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))