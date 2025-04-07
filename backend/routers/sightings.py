from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services import sightings as sightings_service
from typing import List, Optional

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
    return sightings_service.get_all_sightings(db)
