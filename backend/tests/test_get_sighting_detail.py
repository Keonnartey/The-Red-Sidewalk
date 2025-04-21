from services.sighting_detail import get_sighting_detail
from database import get_db
import json
import datetime

def custom_json_serializer(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def test_detail():
    db_gen = get_db()
    db = next(db_gen)
    try:
        result = get_sighting_detail(db, 22)
        print("🎯 Full Sighting Result:\n")
        print(json.dumps(result, indent=2, default=custom_json_serializer))
    finally:
        db.close()

if __name__ == "__main__":
    test_detail()
