from sqlalchemy.orm import Session
from sqlalchemy import text
import boto3
import os
import requests

# Global config
s3 = boto3.client("s3")
BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")


def fetch_preview_info(db: Session, sighting_id: int) -> dict | None:
    stmt = text("""
        SELECT sighting_id, user_id, creature_id, location_name, description_short,
               height_inch, weight_lb, sighting_date,
               ST_X(geom) AS longitude, ST_Y(geom) AS latitude
        FROM info.sightings_preview
        WHERE sighting_id = :sighting_id
    """)
    result = db.execute(stmt, {"sighting_id": sighting_id}).fetchone()
    
    return dict(result._mapping) if result else None

def fetch_average_rating(db: Session, sighting_id: int) -> dict:
    stmt = text("""
        SELECT avg_rating, rating_count
        FROM agg.sightings_ratings
        WHERE sighting_id = :sighting_id
    """)
    result = db.execute(stmt, {"sighting_id": sighting_id}).fetchone()
    return dict(result._mapping) if result else {"avg_rating": 0, "rating_count": 0}


def fetch_image_keys(db: Session, sighting_id: int) -> list[str]:
    stmt = text("""
        SELECT img_url
        FROM info.sightings_imgs
        WHERE sighting_id = :sighting_id
    """)
    rows = db.execute(stmt, {"sighting_id": sighting_id}).fetchall()
    return [row[0] for row in rows]


def generate_presigned_urls(s3_keys: list[str]) -> list[str]:
    lambda_url = os.environ.get("LAMBDA_GET_PRESIGN_ENDPOINT")
    urls = []
    for key in s3_keys:
        response = requests.post(lambda_url, json={"key": key})
        if response.status_code == 200:
            urls.append(response.json()["url"])
        else:
            raise Exception(f"Failed to generate URL for {key}: {response.text}")
    return urls


def get_sighting_detail(db: Session, sighting_id: int) -> dict | None:
    preview_data = fetch_preview_info(db, sighting_id)
    if preview_data is None:
        return None

    # 👇 Add this
    rating_info = fetch_average_rating(db, sighting_id)
    preview_data.update(rating_info)

    s3_keys = fetch_image_keys(db, sighting_id)
    signed_urls = generate_presigned_urls(s3_keys)

    return {
        "sighting_id": sighting_id,
        "preview": preview_data,
        "images": signed_urls
    }
