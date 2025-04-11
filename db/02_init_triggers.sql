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
