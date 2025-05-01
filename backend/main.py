from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers import (
    sightings,
    report,
    lore,
    users,
    discuss,
    filters,
    ratings,
    content_flags,
    badges,
    friends,
    profile,
)
from utils.static_files import setup_static_files
import os
from pathlib import Path


# Make sure all required directories exist
def ensure_upload_dirs():
    upload_dirs = ["static", "static/uploads", "static/uploads/profile_pictures"]

    for dir_path in upload_dirs:
        path = Path(dir_path)
        if not path.exists():
            print(f"Creating directory: {path}")
            path.mkdir(parents=True, exist_ok=True)

        # Ensure proper permissions
        os.chmod(path, 0o755)
        print(f"Set permissions for: {path}")


# Call this before starting the app
ensure_upload_dirs()
app = FastAPI()

# CORS middleware (for connecting with frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")


@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


# Setup static file serving for uploads
app = setup_static_files(app)

# Include your routers here
app.include_router(sightings.router, prefix="/sightings", tags=["Sightings"])
app.include_router(report.router, prefix="/reports", tags=["Report"])
app.include_router(badges.router, prefix="/badges", tags=["Badges"])
app.include_router(filters.router, prefix="/filters", tags=["Filters"])
app.include_router(lore.router, prefix="/lore", tags=["Lore"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(discuss.router, prefix="/discuss", tags=["Discuss"])
app.include_router(ratings.router, prefix="/ratings", tags=["Ratings"])

app.include_router(
    content_flags.router, prefix="/content_flags", tags=["Content_Flagging"]
)
app.include_router(friends.router, prefix="/friends", tags=["Friends"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])


# Mount static files directories
app.mount("/static", StaticFiles(directory="static"), name="static")
