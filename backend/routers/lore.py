from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import avg_creature_info as creature_info

router = APIRouter()

@router.get("/{creature_name}")
def get_all_sightings(creature_name: str, db: Session = Depends(get_db)):
    data = creature_info.get_avgs(db, creature_name)
    return data