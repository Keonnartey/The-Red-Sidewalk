
from sqlalchemy.orm import Session
from geojson import Feature, FeatureCollection, Point
from sqlalchemy import text
from fastapi import APIRouter, Depends, Query
import logging
from database import get_db


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
}



# Log to confirm that logging is set up correctly before the function
logger.info("Logger is set up and working!")

router = APIRouter()

def get_filtered_sightings(db: Session, creature_id: int):
    logger.info(f"Received request to filter by creature_id={creature_id}")
    sql = text("""
        SELECT 
            sighting_id,
            user_id,
            creature_id,
            location_name,
            description_short,
            height_inch,
            sighting_date,
            created_at,
            ST_X(geom) AS longitude,
            ST_Y(geom) AS latitude
        FROM info.sightings_preview
        WHERE creature_id = :creature_id;
    """)
    
    # Execute the query with the dynamic creature_id parameter
    result = db.execute(sql, {"creature_id": creature_id})
    rows = result.fetchall()

    logger.info(f"Found {len(rows)} sightings")

    features = []
    
    for row in rows:
        feature = Feature(
            geometry=Point((row.longitude, row.latitude)),
            properties={
                "sighting_id": row.sighting_id,
                "user_id": row.user_id,
                "creature_id": row.creature_id,
                "creature_type": creature_types.get(row.creature_id, "ghost"),
                "location_name": row.location_name,
                "description": row.description_short,
                "height_inch": row.height_inch,
                "sighting_date": row.sighting_date.isoformat() if row.sighting_date else None,
                "created_at": row.created_at.isoformat() if row.created_at else None
            }
        )
        features.append(feature)

    return FeatureCollection(features)

