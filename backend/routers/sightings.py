from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import sightings as sightings_service

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
    return sightings_service.get_all_sightings(db)