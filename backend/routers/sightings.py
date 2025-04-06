<<<<<<< HEAD
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services import sightings as sightings_service
from typing import List, Optional

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
=======
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import sightings as sightings_service

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
>>>>>>> 3b6ba7de1c6fef58cb36dfd8b95993ba6dbcedfc
    return sightings_service.get_all_sightings(db)