from sqlalchemy.orm import Session
from typing import Dict, Any
from sqlalchemy import text

def insert_sighting(db: Session, body: Dict[str, Any]):
    # Insert into sightings_preview and return the new sighting_id
    preview_stmt = text("""
        INSERT INTO info.sightings_preview (
            user_id,
            creature_id,
            location_name,
            description_short,
            height_inch,
            weight_lb,
            sighting_date,
            geom
        )
        VALUES (
            :user_id,
            :creature_id,
            :location_name,
            :description_short,
            :height_inch,
            :weight_lb,
            :sighting_date,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )
        RETURNING sighting_id
    """)

    result = db.execute(preview_stmt, {
        "user_id": body["user_id"],
        "creature_id": body["creature_id"],
        "location_name": body["location_name"],
        "description_short": body["description_short"],
        "height_inch": body["height_inch"],
        "weight_lb": body["weight_lb"],
        "sighting_date": body["sighting_date"],
        "latitude": body["latitude"],
        "longitude": body["longitude"]
    })

    sighting_id = result.scalar_one()

    # Insert photo keys (if provided)
    photo_keys = body.get("photo_s3_keys", [])
    if photo_keys:
        img_stmt = text("""
            INSERT INTO info.sightings_imgs (sighting_id, img_url)
            VALUES (:sighting_id, :img_url)
        """)
        for key in photo_keys:
            db.execute(img_stmt, {
                "sighting_id": sighting_id,
                "img_url": key
            })

    db.commit()
