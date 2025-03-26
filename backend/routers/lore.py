from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import avg_creature_info as creature_info

router = APIRouter()

@router.get("/")
def get_all_sightings(db: Session = Depends(get_db)):
    return creature_info.get_avgs(db)