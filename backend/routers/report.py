from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from services.sighting_insert import insert_sighting
import logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/")
async def report_sighting(request: Request, db: Session = Depends(get_db)):
    try:
        body: Dict[str, Any] = await request.json()
        logger.info(f"Incoming sighting payload: {body}")  # 👈 log the input
        insert_sighting(db, body)
        return {"status": "success"}
    except Exception as e:
        logger.exception("Failed to insert sighting")  # 👈 full traceback
        raise HTTPException(status_code=500, detail=str(e))
