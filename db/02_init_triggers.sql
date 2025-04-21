------------------------------------------------------------
-- Function to update avg_height after a new sighting
------------------------------------------------------------
CREATE OR REPLACE FUNCTION agg.update_creature_avg_height()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agg.creatures
    SET avg_height = sub.avg_height
    FROM (
        SELECT
            creature_id,
            AVG(height_inch) AS avg_height
        FROM
            info.sightings_preview
        WHERE
            creature_id = NEW.creature_id
        GROUP BY
            creature_id
    ) sub
    WHERE agg.creatures.creature_id = sub.creature_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- Trigger on info.sightings_preview
------------------------------------------------------------
CREATE TRIGGER trigger_update_avg_height
AFTER INSERT ON info.sightings_preview
FOR EACH ROW
EXECUTE FUNCTION agg.update_creature_avg_height();


------------------------------------------------------------
------------------------------------------------------------
-- Function to update avg weight after a new sighting
------------------------------------------------------------
CREATE OR REPLACE FUNCTION agg.update_creature_avg_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agg.creatures
    SET avg_weight = sub.avg_weight
    FROM (
        SELECT
            creature_id,
            AVG(weight_lb) AS avg_weight
        FROM
            info.sightings_preview
        WHERE
            creature_id = NEW.creature_id
        GROUP BY
            creature_id
    ) sub
    WHERE agg.creatures.creature_id = sub.creature_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------------------------------------------------------
-- Trigger on info.sightings_preview
------------------------------------------------------------
CREATE TRIGGER trigger_update_avg_weight
AFTER INSERT ON info.sightings_preview
FOR EACH ROW
EXECUTE FUNCTION agg.update_creature_avg_weight();


----------------------------------------------------
-- Make a row with every new sighting
----------------------------------------------------

CREATE OR REPLACE FUNCTION agg.init_sighting_rating()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agg.sightings_ratings (sighting_id)
    VALUES (NEW.sighting_id)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------------------------------------------------------
-- Trigger on info.sightings_preview
------------------------------------------------------------
CREATE TRIGGER trigger_init_sighting_rating
AFTER INSERT ON info.sightings_preview
FOR EACH ROW
EXECUTE FUNCTION agg.init_sighting_rating();



------------------------------------------------------------
-- Function to update avg_rating from social.ratings table
------------------------------------------------------------
CREATE OR REPLACE FUNCTION agg.update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agg.sightings_ratings
    SET avg_rating = sub.avg_rating, 
    rating_count = sub.rating_count
    FROM (
        SELECT
            sighting_id,
            AVG(rating) AS avg_rating, 
            COUNT(rating_id) AS rating_count
        FROM
            social.ratings
        WHERE
            sighting_id = NEW.sighting_id
        GROUP BY
            sighting_id
    ) sub
    WHERE agg.sightings_ratings.sighting_id = sub.sighting_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------------------------------------------------------
-- Trigger on social.ratings
------------------------------------------------------------
CREATE TRIGGER trigger_update_avg_rating
AFTER INSERT OR UPDATE ON social.ratings
FOR EACH ROW
EXECUTE FUNCTION agg.update_avg_rating();



----------------------------------------------------
-- Make a row with every new sighting
----------------------------------------------------

CREATE OR REPLACE FUNCTION agg.init_sighting_comments()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agg.click_data (sighting_id)
    VALUES (NEW.sighting_id)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------------------------------------------------------
-- Trigger on info.sightings_preview
------------------------------------------------------------
CREATE TRIGGER trigger_init_sighting_comments
AFTER INSERT ON info.sightings_preview
FOR EACH ROW
EXECUTE FUNCTION agg.init_sighting_comments();

------------------------------------------------------------
-- Function to update total_comments from social.interactions table
------------------------------------------------------------
CREATE OR REPLACE FUNCTION agg.update_total_comments()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agg.click_data
    SET total_comments = sub.total_comments
        FROM (
        SELECT
            sighting_id,
            COUNT(comment_id) AS total_comments
        FROM
            social.interactions
        WHERE
            sighting_id = NEW.sighting_id
        GROUP BY
            sighting_id
    ) sub
    WHERE agg.click_data.sighting_id = sub.sighting_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------------------------------------------------------
-- Trigger on info.sightings_preview
------------------------------------------------------------
CREATE TRIGGER trigger_update_total_comments
AFTER INSERT ON social.interactions
FOR EACH ROW
EXECUTE FUNCTION agg.update_total_comments();



-- ========================================
-- FUNCTION: Recalculate Popularity Score
-- ========================================
CREATE OR REPLACE FUNCTION rankings.recalculate_most_popular()
RETURNS void AS $$
BEGIN
    -- Upsert top-ranked sightings per creature
    WITH popularity_scores AS (
        SELECT 
            sp.creature_id,
            sp.sighting_id,
            COALESCE(cd.total_comments, 0) * 1.5 +
            COALESCE(cd.total_clicks, 0) * 2 +
            COALESCE(sr.avg_rating, 0) * 3 +
            COALESCE(sf.upvote_count, 0) * 1 AS score
        FROM info.sightings_preview sp
        LEFT JOIN agg.click_data cd ON cd.sighting_id = sp.sighting_id
        LEFT JOIN agg.sightings_ratings sr ON sr.sighting_id = sp.sighting_id
        LEFT JOIN info.sightings_full sf ON sf.sighting_id = sp.sighting_id
    ),
    ranked AS (
        SELECT 
            creature_id,
            sighting_id,
            RANK() OVER (PARTITION BY creature_id ORDER BY score DESC) AS rank
        FROM popularity_scores
    )
    INSERT INTO rankings.most_popular_sightings (creature_id, rank, sighting_id)
    SELECT creature_id, rank, sighting_id
    FROM ranked
    ON CONFLICT (creature_id, sighting_id)
    DO UPDATE SET rank = EXCLUDED.rank;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger for social.ratings
CREATE OR REPLACE FUNCTION trigger_update_rankings_on_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM rankings.recalculate_most_popular();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upsert_popularity_rating ON social.ratings;
CREATE TRIGGER trg_update_rankings_rating
AFTER INSERT OR UPDATE ON social.ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_update_rankings_on_rating();

-- Trigger for social.comments
CREATE OR REPLACE FUNCTION trigger_update_rankings_on_comment()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM rankings.recalculate_most_popular();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upsert_popularity_comment ON social.interactions;
CREATE TRIGGER trg_update_rankings_comment
AFTER INSERT OR UPDATE ON social.interactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_rankings_on_comment();

-- Trigger for info.sightings_full (upvote_count change)
CREATE OR REPLACE FUNCTION trigger_update_rankings_on_upvote()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM rankings.recalculate_most_popular();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upsert_popularity_upvote ON info.sightings_full;
CREATE TRIGGER trg_update_rankings_upvote
AFTER INSERT OR UPDATE OF upvote_count ON info.sightings_full
FOR EACH ROW
EXECUTE FUNCTION trigger_update_rankings_on_upvote();


------------------------------------------------------
-- User profile aggs
------------------------------------------------------
CREATE OR REPLACE FUNCTION profile.update_user_stats(user_id_input INT)
RETURNS void AS $$
BEGIN
    -- Update counts based on live data
    UPDATE profile.user_stats
    SET 
        unique_creature_count = (
            SELECT COUNT(DISTINCT sp.creature_id)
            FROM info.sightings_preview sp
            WHERE sp.user_id = user_id_input
        ),
        total_sightings_count = (
            SELECT COUNT(*)
            FROM info.sightings_preview sp
            WHERE sp.user_id = user_id_input
        ),
        bigfoot_count = (
            SELECT COUNT(*)
            FROM info.sightings_preview sp
            JOIN agg.creatures c ON c.creature_id = sp.creature_id
            WHERE sp.user_id = user_id_input AND c.creature_name = 'Bigfoot'
        ),
        -- repeat for other creature types...
        dragon_count = (SELECT COUNT(*)
            FROM info.sightings_preview sp
            JOIN agg.creatures c ON c.creature_id = sp.creature_id
            WHERE sp.user_id = user_id_input AND c.creature_name = 'Dragon'),
        ghost_count = (SELECT COUNT(*)
            FROM info.sightings_preview sp
            JOIN agg.creatures c ON c.creature_id = sp.creature_id
            WHERE sp.user_id = user_id_input AND c.creature_name = 'Ghost'),
        alien_count = (SELECT COUNT(*)
            FROM info.sightings_preview sp
            JOIN agg.creatures c ON c.creature_id = sp.creature_id
            WHERE sp.user_id = user_id_input AND c.creature_name = 'Alien'),
        vampire_count = (SELECT COUNT(*)
            FROM info.sightings_preview sp
            JOIN agg.creatures c ON c.creature_id = sp.creature_id
            WHERE sp.user_id = user_id_input AND c.creature_name = 'Vampire'),
        total_friends = (
            SELECT COUNT(*) 
            FROM profile.social f
            WHERE f.user_id = user_id_input 
        ),
        comment_count = (
            SELECT COUNT(*) 
            FROM social.interactions
            WHERE user_id = user_id_input
        ),
        like_count = (
            SELECT SUM(upvote_count)
            FROM info.sightings_full
            WHERE user_id = user_id_input
            GROUP BY user_id
        ),
        pictures_count = (
            SELECT COUNT(*) 
            FROM info.sightings_full sf
            JOIN info.sightings_preview sp ON sp.sighting_id = sf.sighting_id
            WHERE sp.user_id = user_id_input AND sf.image IS NOT NULL
        ),
        locations_count = (
            SELECT COUNT(DISTINCT location_id)
            FROM info.sightings_preview
            WHERE user_id = user_id_input
        ),
        user_avg_rating = (
            SELECT AVG(rating)
            FROM social.ratings
            WHERE user_id = user_id_input
        )
    WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;
