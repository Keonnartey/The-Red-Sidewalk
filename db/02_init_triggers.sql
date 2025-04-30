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
            COALESCE(sf.upvote_count, 0) * 1 -
            COALESCE(sf.downvote_count, 0) * 1 AS score
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
    INSERT INTO profile.user_stats (user_id)
    VALUES (user_id_input)
    ON CONFLICT (user_id) DO NOTHING;
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
        comments_count = (
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
            FROM info.sightings_imgs sf
            JOIN info.sightings_preview sp ON sp.sighting_id = sf.sighting_id
            WHERE sp.user_id = user_id_input
        ),
        locations_count = (
            SELECT COUNT(DISTINCT location_name)
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


-- TRIGGERS
-- Trigger on new or updated sightings
CREATE OR REPLACE FUNCTION trigger_update_stats_on_sighting()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM profile.update_user_stats(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_on_sighting
AFTER INSERT OR UPDATE ON info.sightings_preview
FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_on_sighting();

-- Trigger on new comments
CREATE OR REPLACE FUNCTION trigger_update_stats_on_comment()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM profile.update_user_stats(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_on_comment
AFTER INSERT ON social.interactions
FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_on_comment();

-- Trigger on new ratings
CREATE OR REPLACE FUNCTION trigger_update_stats_on_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM profile.update_user_stats(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_on_rating
AFTER INSERT OR UPDATE ON social.ratings
FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_on_rating();

-- Trigger on picture uploaded to sightings_full
CREATE OR REPLACE FUNCTION trigger_update_stats_on_picture()
RETURNS TRIGGER AS $$
DECLARE
    uid INT;
BEGIN
    SELECT user_id INTO uid FROM info.sightings_preview WHERE sighting_id = NEW.sighting_id;
    PERFORM profile.update_user_stats(uid);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_on_picture
AFTER INSERT OR UPDATE OF img_id ON info.sightings_imgs
FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_on_picture();

-- Trigger on new friend connection
CREATE OR REPLACE FUNCTION trigger_update_stats_on_friend()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM profile.update_user_stats(NEW.user_id);
    PERFORM profile.update_user_stats(NEW.friend_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stats_on_friend
AFTER INSERT ON profile.social
FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_on_friend();

------------------------------------------------------------
-- Function to recompute ALL badges for a given user
------------------------------------------------------------
CREATE OR REPLACE FUNCTION profile.update_user_badges(user_id_input INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profile.user_badges_real ub
  SET
    -- saw at least one Bigfoot?
    bigfoot_amateur = (
      SELECT COUNT(*) >= 1
      FROM info.sightings_preview
      WHERE user_id = user_id_input
        AND creature_id = (
          SELECT creature_id
            FROM agg.creatures
           WHERE lower(creature_name) = 'bigfoot'
        )
    ),
    -- made at least one friend?
    lets_be_friends = (
      SELECT COUNT(*) >= 1
      FROM profile.social
      WHERE user_id = user_id_input
    ),
    -- found every creature at least once?
    elite_hunter = (
      SELECT COUNT(DISTINCT creature_id)
      FROM info.sightings_preview
      WHERE user_id = user_id_input
    ) = (SELECT COUNT(*) FROM agg.creatures),
    -- left at least one comment?
    socialite = (
      SELECT COUNT(*) >= 1
      FROM social.interactions
      WHERE user_id = user_id_input
    ),
    -- saw at least two different creature types?
    diversify = (
      SELECT COUNT(DISTINCT creature_id)
      FROM info.sightings_preview
      WHERE user_id = user_id_input
    ) >= 2,
    -- posted sightings in ≥5 distinct locations?
    well_traveled = (
      SELECT COUNT(DISTINCT location_name)
      FROM info.sightings_preview
      WHERE user_id = user_id_input
    ) >= 5,
    -- given at least three 1-star ratings?
    hallucinator = (
      SELECT COUNT(*) >= 3
      FROM social.ratings
      WHERE user_id = user_id_input
        AND rating = 1
    ),
    -- uploaded at least one photo?
    camera_ready = (
      SELECT COUNT(*) >= 1
      FROM info.sightings_imgs si
      JOIN info.sightings_preview sp ON si.sighting_id = sp.sighting_id
      WHERE sp.user_id = user_id_input
    ),
    -- uploaded a dragon selfie?
    dragon_rider = (
      SELECT COUNT(*) >= 1
      FROM info.sightings_imgs si
      JOIN info.sightings_preview sp ON si.sighting_id = sp.sighting_id
      JOIN agg.creatures c           ON sp.creature_id = c.creature_id
      WHERE sp.user_id = user_id_input
        AND lower(c.creature_name) = 'dragon'
    )
  WHERE ub.user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------
-- Triggers to fire badge recalculation
------------------------------------------------------------
-- Whenever someone logs a new sighting:
DROP TRIGGER IF EXISTS trg_badges_on_sighting ON info.sightings_preview;
CREATE TRIGGER trg_badges_on_sighting
  AFTER INSERT ON info.sightings_preview
  FOR EACH ROW
EXECUTE FUNCTION profile.update_user_badges(NEW.user_id);

-- Whenever someone adds a friend:
DROP TRIGGER IF EXISTS trg_badges_on_friend ON profile.social;
CREATE TRIGGER trg_badges_on_friend
  AFTER INSERT ON profile.social
  FOR EACH ROW
EXECUTE FUNCTION profile.update_user_badges(NEW.user_id);

-- Whenever someone leaves a comment:
DROP TRIGGER IF EXISTS trg_badges_on_comment ON social.interactions;
CREATE TRIGGER trg_badges_on_comment
  AFTER INSERT ON social.interactions
  FOR EACH ROW
EXECUTE FUNCTION profile.update_user_badges(NEW.user_id);

-- Whenever someone rates a sighting:
DROP TRIGGER IF EXISTS trg_badges_on_rating ON social.ratings;
CREATE TRIGGER trg_badges_on_rating
  AFTER INSERT OR UPDATE ON social.ratings
  FOR EACH ROW
EXECUTE FUNCTION profile.update_user_badges(NEW.user_id);

-- Whenever someone uploads a photo:
DROP TRIGGER IF EXISTS trg_badges_on_photo ON info.sightings_imgs;
CREATE TRIGGER trg_badges_on_photo
  AFTER INSERT ON info.sightings_imgs
  FOR EACH ROW
EXECUTE FUNCTION profile.update_user_badges(
    (SELECT user_id FROM info.sightings_preview WHERE sighting_id = NEW.sighting_id)
);
