BEGIN;
SET CONSTRAINTS ALL DEFERRED;

------------------------------------------------------------
-- Security Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.security (
    user_id INT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    failed_attempts INT DEFAULT 0,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

------------------------------------------------------------
-- Locations Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.locations (
    location_id INT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

------------------------------------------------------------
-- Sightings_Preview Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_preview (
    sighting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    creature_id INT NOT NULL,
    location_name VARCHAR(255),
    description_short VARCHAR(255) NOT NULL,
    height_inch INT NOT NULL,
    weight_lb INT NOT NULL,
    sighting_date DATE NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Interactions Table
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS social.interactions (
    comment_id INT PRIMARY KEY,
    sighting_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Ratings Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social.ratings (
    rating_id INT PRIMARY KEY,
    sighting_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);



------------------------------------------------------------
-- Sightings_Full Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_full (
    sighting_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    --description_full TEXT NOT NULL,
    --season VARCHAR(255) NOT NULL,
    --weather VARCHAR(255) NOT NULL,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Sightings_Imgs Table 
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS info.sightings_imgs (
    img_id SERIAL PRIMARY KEY,
    sighting_id INT NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);


------------------------------------------------------------
-- Social Table (Fixed Composite Primary Key + Foreign Keys)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.social (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (friend_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);


------------------------------------------------------------
-- User Badges Table (Fixed Name + Primary Key)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.user_badges (
    user_id INT PRIMARY KEY,
    unique_creature_count INT DEFAULT 0,
    total_sightings_count INT DEFAULT 0,
    bigfoot_count INT DEFAULT 0, 
    dragon_count INT DEFAULT 0,
    ghost_count INT DEFAULT 0,
    alien_count INT DEFAULT 0,
    vampire_count INT DEFAULT 0,
    total_friends_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    pictures_count INT DEFAULT 0,
    locations_count INT DEFAULT 0,
    user_avg_rating FLOAT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- User Stats Table (Fixed Name + Primary Key)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.user_stats (
    user_id INT PRIMARY KEY,
    unique_creature_count INT DEFAULT 0,
    total_sightings_count INT DEFAULT 0,
    bigfoot_count INT DEFAULT 0,
    dragon_count INT DEFAULT 0,
    ghost_count INT DEFAULT 0,
    alien_count INT DEFAULT 0,
    vampire_count INT DEFAULT 0,
    total_friends INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    pictures_count INT DEFAULT 0,
    locations_count INT DEFAULT 0,
    user_avg_rating FLOAT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Users Table (Fixed Name + Primary Key)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.users (
    user_id INT PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    user_address VARCHAR NOT NULL, 
    about_me TEXT,
    birthday DATE NOT NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    profile_pic VARCHAR,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Most_Popular_Sightings Table (Fixed)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings.most_popular_sightings (
    creature_id INT,
    rank INT DEFAULT 0,
    sighting_id INT NOT NULL,
    PRIMARY KEY (creature_id, sighting_id),  -- Composite Primary Key
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Most_Popular_Comments Table (Fixed)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings.most_popular_comments (
    creature_id INT,
    rank INT DEFAULT 0,
    comment_id INT NOT NULL,
    PRIMARY KEY (creature_id, comment_id),  -- Composite Primary Key
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (comment_id) REFERENCES social.interactions(comment_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Sightings_Ratings Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agg.sightings_ratings (
    sighting_id INT PRIMARY KEY,
    avg_rating FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

------------------------------------------------------------
-- Click_Data Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agg.click_data (
    sighting_id INT PRIMARY KEY,
    total_clicks INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);


COMMIT;