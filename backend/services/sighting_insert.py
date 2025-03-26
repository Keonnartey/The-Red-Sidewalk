from sqlalchemy.orm import Session
from typing import Dict, Any
from sqlalchemy import text

def insert_sighting(db: Session, body: Dict[str, Any]):
    stmt = text("""
        INSERT INTO info.sightings_preview (
            user_id,
            creature_id,
            location_name,
            description_short,
            height_inch,
            sighting_date,
            geom
        )
        VALUES (
            :user_id,
            :creature_id,
            :location_name,
            :description_short,
            :height_inch,
            :sighting_date,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )
    """)

    db.execute(stmt, {
        "user_id": body["user_id"],
        "creature_id": body["creature_id"],
        "location_name": body["location_name"],
        "description_short": body["description_short"],
        "height_inch": body["height_inch"],
        "sighting_date": body["sighting_date"],
        "latitude": body["latitude"],
        "longitude": body["longitude"]
    })
    db.commit()
