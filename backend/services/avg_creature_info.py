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
    stmt = text("""
        SELECT avg_height FROM agg.creatures WHERE LOWER(creature_name) = LOWER(:creature_name)
""")
    result = db.execute(sql, {"creature_name": creature_name}).fetchone()

    if result:
        return {
                "height": f"{round(result.avg_height / 12, 2)} feet" if result.avg_height else "Unknown",
                "weight": f"{round(result.avg_weight, 2)} pounds" if result.avg_weight else "Unknown",

            }
    return {"height": "Unknown", "weight": "Unknown"}

  
