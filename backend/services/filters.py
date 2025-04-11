from sqlalchemy.orm import Session
from geojson import Feature, FeatureCollection, Point
from sqlalchemy import text
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Creature type mapping
creature_types = {
    1: "ghost",
    2: "bigfoot",
    3: "dragon",
    4: "alien",
}

def get_filtered_sightings(db: Session, creature_id: int):
    """
    Retrieve sightings filtered by creature type
    
    :param db: Database session
    :param creature_id: ID of the creature to filter
    :return: GeoJSON FeatureCollection of sightings
    """
    try:
        logger.info(f"Filtering sightings for creature_id: {creature_id}")
        
        # SQL query to fetch sightings
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
            WHERE creature_id = :creature_id;
        """)
        
        # Execute the query
        result = db.execute(sql, {"creature_id": creature_id})
        rows = result.fetchall()
        
        logger.info(f"Found {len(rows)} sightings")
        
        # Create features
        features = []
        for row in rows:
            feature = Feature(
                geometry=Point((row.longitude, row.latitude)),
                properties={
                    "sighting_id": row.sighting_id,
                    "user_id": row.user_id,
                    "creature_id": row.creature_id,
                    "creature_type": creature_types.get(row.creature_id, "unknown"),
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
    
    except Exception as e:
        logger.error(f"Error filtering sightings: {str(e)}")
        raise