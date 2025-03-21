------------------------------------------------------------
-- Sightings_Preview Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_preview (
    sighting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    creature_id INT NOT NULL,
    location_id VARCHAR(255) NOT NULL,
    description_short VARCHAR(255) NOT NULL,
    height_inch INT NOT NULL,
    sighting_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE,
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Sightings_Full Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_full (
    sighting_id INT PRIMARY KEY,
    description_full TEXT NOT NULL,
    season VARCHAR(255) NOT NULL,
    weather VARCHAR(255) NOT NULL,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Sightings_Imgs Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_imgs (
    img_id SERIAL PRIMARY KEY,
    sighting_id INT NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Locations Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.locations (
    location_id INT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
    FOREIGN KEY (location_id) REFERENCES info.sightings_preview(location_id) ON DELETE CASCADE
);