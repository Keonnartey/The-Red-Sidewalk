from sqlalchemy.orm import Session
from sqlalchemy import text

def get_avgs(db: Session, creature_name: str):
    sql = text("""
        SELECT 
           AVG(height_inch) AS avg_height

        FROM info.sightings_preview i, agg.creatures a
        WHERE i.creature_id = a.creature_id AND LOWER(a.creature_name) = LOWER(:creature_name)
        GROUP BY i.creature_id       
               ;
    """)
    stmt = text("""
        SELECT avg_height FROM agg.creatures WHERE LOWER(creature_name) = LOWER(:creature_name)
""")
    result = db.execute(sql, {"creature_name": creature_name}).fetchone()

    if result:
        return {
                "height": f"{round(result.avg_height / 12, 2)} feet" if result.avg_height else "Unknown",

            }
    return {"height": "Unknown"}

  
