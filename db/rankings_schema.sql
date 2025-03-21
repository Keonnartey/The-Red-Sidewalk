------------------------------------------------------------
-- Most_Popular_Sightings Table (Fixed)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings.most_popular_sightings (
    creature_id INT,
    rank INT DEFAULT 0,
    sighting_id INT NOT NULL,
    PRIMARY KEY (creature_id, sighting_id),  -- Composite Primary Key
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE,
    FOREIGN KEY (sighting_id) REFERENCES info.sightings_preview(sighting_id) ON DELETE CASCADE
);

------------------------------------------------------------
-- Most_Popular_Comments Table (Fixed)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rankings.most_popular_comments (
    creature_id INT,
    rank INT DEFAULT 0,
    comment_id INT NOT NULL,
    PRIMARY KEY (creature_id, comment_id),  -- Composite Primary Key
    FOREIGN KEY (creature_id) REFERENCES agg.creatures(creature_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES social.interactions(comment_id) ON DELETE CASCADE
);
