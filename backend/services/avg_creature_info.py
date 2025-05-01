from sqlalchemy.orm import Session
from sqlalchemy import text

def get_avgs(db: Session, creature_name: str):
    sql = text("""
        SELECT 
           avg_height, avg_weight

        FROM agg.creatures a
        WHERE LOWER(a.creature_name) = LOWER(:creature_name)
        GROUP BY a.creature_id       
               ;
    """)
    
    result = db.execute(sql, {"creature_name": creature_name}).fetchone()

    loc_sql = text("""
        SELECT location_name, COUNT(*) as sighting_count 
                   FROM info.sightings_preview i, agg.creatures a
                   WHERE i.creature_id = a.creature_id AND LOWER(a.creature_name) = LOWER(:creature_name)
                   GROUP BY location_name ORDER BY sighting_count DESC
                   LIMIT 1;
                   """)
    location_result = db.execute(loc_sql, {"creature_name": creature_name}).fetchone()

    sightings_sql = text("""
        SELECT 
            i.sighting_id,
            i.description_short,
            i.location_name,
            i.sighting_date, 
            r.rank
            FROM info.sightings_preview i, agg.creatures a, rankings.most_popular_sightings r
        WHERE i.creature_id = a.creature_id AND LOWER(a.creature_name) = LOWER(:creature_name) AND r.creature_id = i.creature_id AND r.sighting_id = i.sighting_id AND r.rank < 4
        ORDER BY r.rank ASC
        LIMIT 3;
    """)
    sightings_result = db.execute(sightings_sql, {"creature_name": creature_name}).fetchall()
    # Format top sightings
    top_sightings = []
    if sightings_result:
        for row in sightings_result:
            top_sightings.append({
                "id": str(row.sighting_id),
                "description": row.description_short,
                "location": row.location_name,
                "date": row.sighting_date.strftime("%B %d, %Y") if row.sighting_date else "Unknown"
            })
            
    print(f"Sightings for {creature_name}:", len(top_sightings))
    # Get newest sightings
    newest_sql = text("""
        SELECT 
            i.sighting_id,
            i.description_short,
            i.location_name,
            i.sighting_date
        FROM info.sightings_preview i
        JOIN agg.creatures a ON i.creature_id = a.creature_id
        WHERE LOWER(a.creature_name) = LOWER(:creature_name)
        ORDER BY i.sighting_date DESC, i.created_at DESC
        LIMIT 3;
    """)
    newest_result = db.execute(newest_sql, {"creature_name": creature_name}).fetchall()
    # Format newest sightings
    newest_sightings = []
    if newest_result:
        for row in newest_result:
            newest_sightings.append({
                "id": str(row.sighting_id),
                "description": row.description_short if row.description_short else "No description available",
                "location": row.location_name if row.location_name else "Unknown location",
                "date": row.sighting_date.strftime("%B %d, %Y") if row.sighting_date else "Unknown date"
            })
    response = {
        "height": f"{round(result.avg_height / 12, 2)} feet" if result and result.avg_height else "Unknown",
        "weight": f"{round(result.avg_weight, 2)} pounds" if result and result.avg_weight else "Unknown",
        "locations": location_result.location_name if location_result else "Unknown",
        "popularSightings": top_sightings,
        "newestSightings": newest_sightings
    }
    return response

  
