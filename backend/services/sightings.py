from sqlalchemy.orm import Session
from geojson import Feature, FeatureCollection, Point
from sqlalchemy import text

def get_all_sightings(db: Session):
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
