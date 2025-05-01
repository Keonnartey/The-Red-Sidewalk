from sqlalchemy.orm import Session
from geojson import Feature, FeatureCollection, Point
from sqlalchemy import text
from services import content_flags as content_flags_service

def get_all_sightings(db: Session):
    # 🚫 get flagged sightings to hide
    hidden_ids = content_flags_service.get_hidden_content_ids(db)

    # 🧠 if no flags, skip filtering
    if hidden_ids:
        sql = text("""
            SELECT 
                sighting_id,
                user_id,
                creature_id,
                location_name,
                description_short,
                height_inch,
                weight_lb,
                sighting_date,
                created_at,
                ST_X(geom) AS longitude,
                ST_Y(geom) AS latitude
            FROM info.sightings_preview
            WHERE sighting_id NOT IN :hidden_ids;
        """)
        result = db.execute(sql, {"hidden_ids": tuple(hidden_ids)})
    else:
        sql = text("""
            SELECT 
                sighting_id,
                user_id,
                creature_id,
                location_name,
                description_short,
                height_inch,
                weight_lb,
                sighting_date,
                created_at,
                ST_X(geom) AS longitude,
                ST_Y(geom) AS latitude
            FROM info.sightings_preview;
        """)
        result = db.execute(sql)
    
    rows = result.fetchall()

    features = []

    creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
    5: "vampire"
    }

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
                "weight_lb": row.weight_lb,
                "sighting_date": row.sighting_date.isoformat() if row.sighting_date else None,
                "created_at": row.created_at.isoformat() if row.created_at else None
            }
        )
        features.append(feature)

    return FeatureCollection(features)
