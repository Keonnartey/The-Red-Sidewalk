from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import sightings, report, lore, users, discuss  # Example router import

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


# Include your routers here
app.include_router(sightings.router, prefix="/sightings", tags=["Sightings"])
app.include_router(report.router, prefix="/reports", tags=["Report"])
app.include_router(lore.router, prefix = '/lore', tags = ["Lore"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(discuss.router, prefix="/discuss", tags=["Discuss"])  # Example router include

