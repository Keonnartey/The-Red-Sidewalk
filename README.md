# 🦇 Cryptid Sightings
## Team Members: Jenny Chen, Aarya Desai, Matthew Holden, Katelyn Hucker, Keon Nartey

[![Backend: FastAPI](https://img.shields.io/badge/backend-FastAPI-blue?logo=fastapi)](https://fastapi.tiangolo.com/) [![Frontend: Next.js](https://img.shields.io/badge/frontend-Next.js-black?logo=next.js)](https://nextjs.org/) [![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)]

A **community-driven** platform where enthusiasts report, discuss, and rate sightings of mythical creatures from around the world. Whether you’ve glimpsed a UFO or snapped a photo of a dragon, share your evidence and join the hunt!

---

## Table of Contents:
- [Introduction](#-introduction)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)


## 📝 Introduction 
Cryptid Sightings is an open-source web app designed to unite cryptozoology fans worldwide. Users can:
- Report their own sightings with photos, detailed descriptions, and location metadata.
- Browse an interactive map and paginated lists of historical and recent sightings.
- Discuss evidence in threaded comments, upvote/downvote claims, and flag inappropriate content.
- Rate how credible each sighting appears using a 1–5 scale.
- Build a social network by friending other users and following their discoveries.
- Explore curated lore pages that aggregate sighting statistics and fun facts for each creature.
Whether you’re a skeptic or a believer, Cryptid Sightings makes it easy to share data, build community, and keep track of your favorite creatures.


## 🚀 Features

- **🗺 Interactive Map & Filters** 
    + Filter sightings by creature, date range, or geographic region—zoom in to hotspots!
- **📣 Report a Sighting**
    + Submit text, images, timestamp, and optional GPS coordinates. Presigned URLs ensure secure uploads to S3.
- **💬 Discussion Forum**
    + Create posts, comment threads, and upvote/downvote to highlight the most compelling evidence.
- **⭐ Credibility Ratings**
    + Crowdsource a “trust” score on each sighting; see average ratings and rating history.
- **🚩 Content Moderation**
    + Flag posts or comments for review—admins can retrieve and act on flags.
- **🤝 Social Graph**
    + Add/remove friends, view friends’ recent sightings, and get notified of their activity.
- **📊 Creature Lore Pages**
    + Aggregate average ratings, total sightings, trending locations, and fun facts for each cryptid.

---

## 🏗 Architecture Overview

1. Backend (FastAPI)
    + Exposes RESTful JSON endpoints under /api/*.
    + Uses SQLAlchemy ORM with PostgreSQL for data persistence.
    + S3 presigned-URL service for secure image uploads (via AWS Lambda integration).
    + OAuth2 / JWT authentication for user sessions.
2. Frontend (Next.js + React + Tailwind)
    + SSR/SSG pages for SEO-friendly creature lore and user profiles.
    + Client-side dynamic pages for reporting, discussion, and maps.
    + Tailwind CSS for design consistency and rapid styling.
3. DevOps & Infrastructure
    + Docker & Docker Compose for local development.
    + Alembic for database migrations.
    + CI/CD pipeline can deploy to AWS ECS / Vercel.

--- 

## 📂 Project Structure
```
.
├── backend/
│   ├── routers/
│   │   ├── content_flags.py   # Flag creation & retrieval
│   │   ├── discuss.py         # Posts, comments, votes & presigned URLs
│   │   ├── filters.py         # Creature-based filtering
│   │   ├── friends.py         # Friend list & toggle
│   │   ├── lore.py            # Creature lore & averages
│   │   ├── profile.py         # User profiles & badges
│   │   ├── ratings.py         # Submit & update ratings
│   │   ├── report.py          # Report new sighting endpoint
│   │   ├── sightings.py       # List & detail endpoints
│   │   └── users.py           # Authentication & user management
│   ├── services/              # Business-logic modules
│   ├── database.py            # DB session & models
│   ├── config.py              # Env vars & secrets
│   └── main.py                # FastAPI app & router registration
│
├── frontend/
│   ├── pages/                 # Next.js pages & dynamic routes
│   ├── components/            # Reusable React UI components
│   ├── styles/                # Tailwind CSS config & custom styles
│   └── public/                # Static assets
│
├── scripts/                   # DB migrations, seeders, helpers
├── .env.example               # Environment variable template
├── requirements.txt           # Python dependencies
├── package.json               # Frontend dependencies & scripts
└── README.md                  # ← You’re here
```


---

## 🛠️ Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| **Backend** | Python • FastAPI • SQLAlchemy • PostgreSQL |
| **Frontend**| Next.js • React • Tailwind CSS        |
| **Storage** | AWS S3 (presigned URLs via Lambda)    |
| **Auth**    | OAuth2 / JWT                          |
| **DevOps**  | Docker • Docker Compose               |

---

## 📥 Prerequisites

- Node.js & npm (v16+)
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL (v13+) or Docker-based PostGIS if you need geo queries

--- 

## ⚡ Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/your-org/cryptid-sightings.git
cd cryptid-sightings
```
2. Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
alembic upgrade head
uvicorn main:app --reload
```
3. Frontend
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
npm run dev
```

---

## 🔧 Configuration
| Variable                                      | Description                                                  |
| --------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                                | PostgreSQL DSN (e.g., `postgresql://user:pass@host:port/db`) |
| `SECRET_KEY`                                  | JWT signing secret                                           |
| `ALGORITHM`                                   | JWT algorithm (e.g., `HS256`)                                |
| `ACCESS_TOKEN_EXPIRE_MINUTES`                 | Token expiry (in minutes)                                    |
| `S3_BUCKET` / `S3_REGION`                     | AWS S3 bucket name & region for uploads                      |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials                                              |
| `NEXT_PUBLIC_BACKEND_URL`                     | Frontend API base URL                                        |

--- 

## ▶️ Running the Application

1. Backend API → http://localhost:8000
    + Swagger UI: `/docs`
    + Redoc: `/redoc`
2. Frontend → http://localhost:3000
    + Home, creature lore, report form, map view, profile pages, discussion threads.

--- 

## 🚧 Future Directions

- 🗺 Additional creatures
- 🔔 Real-time notifications for friends’ sightings
- 📈 Analytics dashboard for top cryptids & regions
- 🔒 Two-factor authentication
- 🌐 Internationalization & localization