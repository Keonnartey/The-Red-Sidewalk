------------------------------------------------------------
-- Sightings_Ratings Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agg.sightings_ratings (
    sighting_id INT PRIMARY KEY,
    avg_rating FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Click_Data Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agg.click_data (
    sighting_id INT PRIMARY KEY,
    total_clicks INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Creatures Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agg.creatures (
    creature_id SERIAL PRIMARY KEY,
    creature_name VARCHAR(255) NOT NULL,
    avg_rating FLOAT DEFAULT 0,
    avg_height FLOAT DEFAULT 0,
    avg_weight FLOAT DEFAULT 0
);
