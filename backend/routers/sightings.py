from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import sightings as sightings_service
from typing import List, Optional
from services.sighting_detail import get_sighting_detail

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
    return sightings_service.get_all_sightings(db)

@router.get("/{sighting_id}")
def get_full_sighting(sighting_id: int, db: Session = Depends(get_db)):
    try:
        result = get_sighting_detail(db, sighting_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Sighting not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))