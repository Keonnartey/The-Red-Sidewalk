from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import filters as filters_service
from typing import Dict, Any

router = APIRouter()

@router.get("/filter_creature")
def get_selected_creature(
    creature_id: int, 
    db: Session = Depends(get_db)
):
    """
    Retrieve sightings filtered by creature type
    
    :param creature_id: ID of the creature to filter
    :param db: Database session
    :return: GeoJSON FeatureCollection of sightings
    """
    try:
        # Validate creature_id if needed
        valid_creature_ids = [1, 2, 3, 4]  # Match your creature type mapping
        if creature_id not in valid_creature_ids:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid creature_id. Must be one of {valid_creature_ids}"
            )
        
        return filters_service.get_filtered_sightings(db, creature_id)
    
    except Exception as e:
        # Log the error in your actual implementation
        raise HTTPException(status_code=500, detail=str(e))
