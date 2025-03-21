-- Create Schema
CREATE SCHEMA IF NOT EXISTS profile;

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

INSERT INTO profile.security (user_id, email, password_hash) 
VALUES (1, 'abc@example.com', 'passwordhash'); 

------------------------------------------------------------
-- Social Table (Fixed Composite Primary Key + Foreign Keys)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile.social (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
);

INSERT INTO profile.social (user_id, friend_id) 
VALUES (1, 2);

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
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
);

INSERT  INTO profile.users (user_id, full_name, user_address, birthday)
    VALUES (1, 'John Sasquatch', '1234 main st', 'I love bigfoot.', '1999-01-01');