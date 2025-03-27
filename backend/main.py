from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import sightings, report  # Example router import

app = FastAPI()

# CORS middleware (for connecting with frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers here
app.include_router(sightings.router, prefix="/sightings", tags=["Sightings"])
app.include_router(report.router, prefix="/reports", tags=["Report"])
