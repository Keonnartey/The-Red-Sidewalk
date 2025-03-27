from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services import filters as filters_service
from typing import List, Optional

router = APIRouter()

@router.get("/filter_creature")
def get_selected_creature(creature_id: int, db: Session = Depends(get_db)):
    return filters_service.get_filtered_sightings(db, creature_id)