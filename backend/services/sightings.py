from sqlalchemy.orm import Session
from geojson import Feature, FeatureCollection, Point
from sqlalchemy import text
from typing import List, Optional

def get_all_sightings(db: Session,  creature_types: Optional[List[str]], seasons: Optional[List[str]]):
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
        FROM 
            info.sightings_preview
        WHERE 1=1;
    """)

    params = {}

    if creature_types:
        sql = sql.text(sql.text + " AND creature_id = ANY(:creature_types)")
        params['creature_types'] = creature_types

    if seasons:
        sql =  sql.text(sql.text + " AND EXTRACT(MONTH FROM sighting_date) = ANY(:season_months)")
        season_months = {
            "spring": [3, 4, 5],
            "summer": [6, 7, 8],
            "fall": [9, 10, 11],
            "winter": [12, 1, 2]
        }
        params["season_months"] = [month for season in seasons for month in season_months.get(season.lower(), [])]


    result = db.execute(sql, params)
    rows = result.fetchall()

    features = []

    creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
    5: "sun"
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
                "sighting_date": row.sighting_date.isoformat() if row.sighting_date else None,
                "created_at": row.created_at.isoformat() if row.created_at else None
            }
        )
        features.append(feature)

    return FeatureCollection(features)
