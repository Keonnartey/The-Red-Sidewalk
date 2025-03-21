------------------------------------------------------------
-- Interactions Table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social.interactions (
    comment_id INT PRIMARY KEY,
    sighting_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sighting_id, user_id),
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
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
    PRIMARY KEY (sighting_id, user_id),
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profile.security(user_id) ON DELETE CASCADE
);