# The-Red-Sidewalk
### Contributors: Aarya Desai, Katelyn Hucker, Keon Nartey, Jenny Chen, Matthew Holden

From the root directory run:

`docker compose up --build`

This will launch the following containerized services:
- postgis SQL Database
- backend FastAPI app
- frontend Next.js app

Front end app is accessible at `http://localhost:3000`

___________

This repository uses the [Mapbox Places API](https://docs.mapbox.com/api/search/geocoding/) for location autocomplete.

To use this feature:

1. Create a file called `.env.local` in the `/cryptid-sightings` directory
2. Paste this into it:

`NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here`

Replace token with the actual api token
