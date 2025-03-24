-- Dummy data for profile.security
INSERT INTO profile.security (user_id, email, password_hash, failed_attempts, last_login) VALUES
(1, 'user1@example.com', 'hashed_password_1', 0, CURRENT_TIMESTAMP),
(2, 'user2@example.com', 'hashed_password_2', 1, CURRENT_TIMESTAMP),
(3, 'user3@example.com', 'hashed_password_3', 0, CURRENT_TIMESTAMP),
(4, 'user4@example.com', 'hashed_password_4', 2, CURRENT_TIMESTAMP),
(5, 'user5@example.com', 'hashed_password_5', 0, CURRENT_TIMESTAMP);


-- Dummy data for agg.creatures
INSERT INTO agg.creatures (creature_id, creature_name, avg_rating, avg_height, avg_weight) VALUES
(1, 'Loch Ness Monster', 4.5, 15.2, 2000),
(2, 'Bigfoot', 4.0, 7.8, 400),
(3, 'Chupacabra', 3.5, 3.1, 60),
(4, 'Mothman', 4.2, 6.5, 120),
(5, 'Kraken', 4.8, 30.0, 5000);


-- Dummy data for info.locations (US-only)
INSERT INTO info.locations (location_id, location_name, latitude, longitude) VALUES
(1, 'Point Pleasant, West Virginia', 38.8487, -82.1371),
(2, 'Bluff Creek, California', 41.3000, -123.8000),
(3, 'El Yunque National Forest, Puerto Rico', 18.2955, -65.7670),
(4, 'Flatwoods, West Virginia', 38.6790, -80.6515),
(5, 'Area 51, Nevada', 37.2350, -115.8111);

-- Dummy data for info.sightings_preview (with GIS geometry)
INSERT INTO info.sightings_preview (
    user_id,
    creature_id,
    location_name,
    description_short,
    height_inch,
    sighting_date,
    geom
) VALUES
(1, 1, 'Point Pleasant, WV', 'Tall figure with glowing red eyes spotted near the bridge.', 78, '2024-03-01',
    ST_SetSRID(ST_MakePoint(-82.1371, 38.8487), 4326)),

(2, 2, 'Bluff Creek, CA', 'Large hairy creature seen crossing a creek.', 96, '2024-02-15',
    ST_SetSRID(ST_MakePoint(-123.8000, 41.3000), 4326)),

(3, 3, 'El Yunque National Forest, PR', 'Strange creature attacking livestock.', 36, '2024-01-10',
    ST_SetSRID(ST_MakePoint(-65.7670, 18.2955), 4326)),

(4, 4, 'Flatwoods, WV', 'Hovering creature with glowing eyes witnessed by local residents.', 72, '2024-01-25',
    ST_SetSRID(ST_MakePoint(-80.6515, 38.6790), 4326)),

(5, 5, 'Area 51, NV', 'Enormous tentacles rising from the desert sands.', 300, '2024-03-10',
    ST_SetSRID(ST_MakePoint(-115.8111, 37.2350), 4326));


-- Dummy data for social.interactions
INSERT INTO social.interactions (
    comment_id,
    sighting_id,
    user_id,
    comment,
    upvote_count,
    downvote_count
) VALUES
(1, 1, 2, 'This sounds legit! I saw something similar.', 10, 2),
(2, 1, 3, 'I dont buy it, looks fake.', 3, 15),
(3, 2, 1, 'Wow, Bigfoot strikes again!', 20, 1),
(4, 3, 4, 'I heard the Chupacabra was spotted last week too.', 5, 0),
(5, 4, 5, 'Mothman is definitely real.', 12, 3),
(6, 5, 2, 'Kraken stories always freak me out.', 8, 1),
(7, 5, 3, 'You need better evidence.', 2, 7),
(8, 3, 1, 'I think it was a dog...', 0, 4),
(9, 4, 2, 'This is why I dont go outside.', 6, 2),
(10, 2, 5, 'Classic hoax location.', 4, 5);

-- Dummy data for social.ratings
INSERT INTO social.ratings (
    rating_id,
    sighting_id,
    user_id,
    rating
) VALUES
(1, 1, 1, 5),
(2, 1, 2, 4),
(3, 1, 3, 5),
(4, 1, 4, 3),
(5, 1, 5, 4),
(6, 1, 2, 5),

(7, 2, 1, 2),
(8, 2, 3, 3),
(9, 2, 4, 4),
(10, 2, 5, 5),
(11, 2, 2, 3),
(12, 2, 3, 4),

(13, 3, 1, 1),
(14, 3, 4, 2),
(15, 3, 5, 3),
(16, 3, 2, 1),
(17, 3, 3, 2),
(18, 3, 4, 3),

(19, 4, 5, 5),
(20, 4, 1, 4),
(21, 4, 2, 3),
(22, 4, 3, 4),
(23, 4, 4, 5),
(24, 4, 5, 4),

(25, 5, 1, 5),
(26, 5, 2, 5),
(27, 5, 3, 5),
(28, 5, 4, 4),
(29, 5, 5, 3),
(30, 5, 1, 4);

-- Dummy data for info.sightings_imgs
INSERT INTO info.sightings_imgs (
    sighting_id,
    img_url
) VALUES
-- Sightings for sighting_id 1
(1, 'https://dummy-s3-url.com/sighting1_img1.jpg'),
(1, 'https://dummy-s3-url.com/sighting1_img2.jpg'),

-- Sightings for sighting_id 2
(2, 'https://dummy-s3-url.com/sighting2_img1.jpg'),
(2, 'https://dummy-s3-url.com/sighting2_img2.jpg'),
(2, 'https://dummy-s3-url.com/sighting2_img3.jpg'),

-- Sightings for sighting_id 3
(3, 'https://dummy-s3-url.com/sighting3_img1.jpg'),

-- Sightings for sighting_id 4
(4, 'https://dummy-s3-url.com/sighting4_img1.jpg'),
(4, 'https://dummy-s3-url.com/sighting4_img2.jpg'),

-- Sightings for sighting_id 5
(5, 'https://dummy-s3-url.com/sighting5_img1.jpg'),
(5, 'https://dummy-s3-url.com/sighting5_img2.jpg'),
(5, 'https://dummy-s3-url.com/sighting5_img3.jpg');

-- Dummy data for profile.social
INSERT INTO profile.social (user_id, friend_id) VALUES
(1, 2),
(2, 1),
(1, 3),
(3, 1),
(2, 3),
(3, 2),
(4, 5),
(5, 4);

-- Dummy data for profile.user_badges
INSERT INTO profile.user_badges (
    user_id,
    unique_creature_count,
    total_sightings_count,
    bigfoot_count,
    dragon_count,
    ghost_count,
    alien_count,
    vampire_count,
    total_friends_count,
    comments_count,
    like_count,
    pictures_count,
    locations_count,
    user_avg_rating
) VALUES
(1, 3, 10, 2, 1, 0, 0, 0, 2, 4, 10, 3, 5, 4.5),
(2, 2, 8, 1, 0, 1, 0, 0, 2, 3, 7, 2, 4, 3.8),
(3, 4, 12, 3, 0, 0, 1, 0, 2, 5, 9, 4, 6, 4.2),
(4, 1, 5, 0, 0, 0, 1, 0, 1, 2, 5, 1, 3, 3.5),
(5, 5, 15, 4, 2, 1, 1, 1, 1, 6, 12, 5, 7, 4.9);

-- Dummy data for profile.user_stats
INSERT INTO profile.user_stats (
    user_id,
    unique_creature_count,
    total_sightings_count,
    bigfoot_count,
    dragon_count,
    ghost_count,
    alien_count,
    vampire_count,
    total_friends,
    comments_count,
    like_count,
    pictures_count,
    locations_count,
    user_avg_rating
) VALUES
(1, 3, 10, 2, 1, 0, 0, 0, 2, 4, 10, 3, 5, 4.5),
(2, 2, 7, 1, 0, 1, 0, 0, 2, 3, 8, 2, 4, 3.7),
(3, 4, 11, 3, 0, 0, 1, 0, 3, 5, 11, 4, 6, 4.3),
(4, 1, 6, 0, 0, 0, 1, 0, 1, 2, 4, 1, 3, 3.6),
(5, 5, 14, 4, 2, 1, 1, 1, 1, 6, 13, 5, 7, 4.8);

-- Dummy data for profile.users
INSERT INTO profile.users (
    user_id,
    full_name,
    user_address,
    about_me,
    birthday,
    profile_pic
) VALUES
(1, 'John Doe', '123 Cryptid Lane, WV', 'Mothman enthusiast.', '1990-05-12', 'https://dummy-s3-url.com/profile1.jpg'),
(2, 'Jane Smith', '456 Bigfoot Ave, CA', 'Bigfoot hunter.', '1985-09-23', 'https://dummy-s3-url.com/profile2.jpg'),
(3, 'Alex Johnson', '789 Chupacabra Blvd, PR', 'Chupacabra tracker.', '1992-03-10', 'https://dummy-s3-url.com/profile3.jpg'),
(4, 'Emily Davis', '321 Loch Ness Rd, NY', 'Loch Ness Monster researcher.', '1988-12-05', 'https://dummy-s3-url.com/profile4.jpg'),
(5, 'Chris Lee', '654 Kraken Bay, FL', 'Kraken diver.', '1995-07-18', 'https://dummy-s3-url.com/profile5.jpg');

-- Dummy data for rankings.most_popular_sightings
INSERT INTO rankings.most_popular_sightings (
    creature_id,
    rank,
    sighting_id
) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5);

-- Dummy data for rankings.most_popular_comments
INSERT INTO rankings.most_popular_comments (
    creature_id,
    rank,
    comment_id
) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 1, 4),
(4, 1, 5),
(5, 1, 6);

-- Dummy data for agg.sightings_ratings
INSERT INTO agg.sightings_ratings (
    sighting_id,
    avg_rating,
    rating_count
) VALUES
(1, 4.2, 6),
(2, 3.5, 6),
(3, 2.0, 6),
(4, 4.4, 6),
(5, 4.6, 6);

-- Dummy data for agg.click_data
INSERT INTO agg.click_data (
    sighting_id,
    total_clicks,
    total_comments
) VALUES
(1, 50, 3),
(2, 30, 2),
(3, 20, 1),
(4, 45, 4),
(5, 60, 5);
