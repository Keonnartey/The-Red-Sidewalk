-- Dummy data for profile.security
INSERT INTO profile.security (user_id, email, password_hash, failed_attempts, last_login) VALUES
(1, 'user1@example.com', '$2b$12$Jv9Lkx0YB.AQgWK3YALc6.j0mZB/RZBb4BysgSJ/1fIBPVsHVa65m', 0, CURRENT_TIMESTAMP),
(2, 'user2@example.com', 'hashed_password_2', 1, CURRENT_TIMESTAMP),
(3, 'user3@example.com', 'hashed_password_3', 0, CURRENT_TIMESTAMP),
(4, 'user4@example.com', 'hashed_password_4', 2, CURRENT_TIMESTAMP),
(5, 'user5@example.com', 'hashed_password_5', 0, CURRENT_TIMESTAMP);


-- Dummy data for agg.creatures
INSERT INTO agg.creatures (creature_id, creature_name) VALUES
(1, 'Ghost'),
(2, 'Bigfoot'),
(3, 'Alien'),
(4, 'Dragon'),
(5, 'Vampire');


-- Dummy data for info.locations (US-only)
INSERT INTO info.locations (location_id, location_name, latitude, longitude) VALUES
(1, 'Point Pleasant, West Virginia', 38.8487, -82.1371),
(2, 'Bluff Creek, California', 41.3000, -123.8000),
(3, 'El Yunque National Forest, Puerto Rico', 18.2955, -65.7670),
(4, 'Flatwoods, West Virginia', 38.6790, -80.6515),
(5, 'Area 51, Nevada', 37.2350, -115.8111);

-- Global dummy data for info.sightings_preview
INSERT INTO info.sightings_preview (
    user_id,
    creature_id,
    location_name,
    description_short,
    height_inch,
    sighting_date,
    geom
) VALUES
-- Europe: Ghost in Scotland
(1, 1, 'Edinburgh Castle, Scotland', 'Mist-like figure gliding through the castle courtyard.', 68, '2024-01-20',
    ST_SetSRID(ST_MakePoint(-3.2000, 55.9486), 4326)),

-- North America: Bigfoot in Canada
(2, 2, 'Banff National Park, Canada', 'Massive bipedal creature leaving deep tracks in the snow.', 96, '2024-02-04',
    ST_SetSRID(ST_MakePoint(-115.5708, 51.4968), 4326)),

-- Asia: Dragon over China
(3, 3, 'Zhangjiajie National Forest, China', 'Winged serpent flying between sandstone pillars.', 220, '2024-03-03',
    ST_SetSRID(ST_MakePoint(110.4792, 29.3257), 4326)),

-- South America: Alien in Chile
(4, 4, 'Atacama Desert, Chile', 'Bright lights and hovering being spotted at midnight.', 48, '2024-03-07',
    ST_SetSRID(ST_MakePoint(-69.1112, -24.5000), 4326)),

-- Africa: Ghost in Egypt
(5, 1, 'Giza Plateau, Egypt', 'Phantom figure moving near ancient tomb entrance.', 65, '2024-01-28',
    ST_SetSRID(ST_MakePoint(31.1342, 29.9792), 4326)),

-- Oceania: Bigfoot-like creature in Australia
(1, 2, 'Blue Mountains, Australia', 'Tall hairy creature sighted in eucalyptus forest.', 94, '2024-02-12',
    ST_SetSRID(ST_MakePoint(150.4020, -33.7125), 4326)),

-- Asia: Dragon in Bhutan
(2, 3, 'Paro Valley, Bhutan', 'Dragon spotted circling over monastery rooftops.', 210, '2024-03-14',
    ST_SetSRID(ST_MakePoint(89.4120, 27.4305), 4326)),

-- North America: Alien near Area 51
(3, 4, 'Rachel, Nevada, USA', 'Glowing figure emerging from a field near Highway 375.', 52, '2024-02-24',
    ST_SetSRID(ST_MakePoint(-115.7460, 37.6486), 4326)),

-- Europe: Ghost in France
(4, 1, 'Mont Saint-Michel, France', 'Semi-transparent woman drifting above flooded causeway.', 62, '2024-01-30',
    ST_SetSRID(ST_MakePoint(-1.5115, 48.6361), 4326)),

-- South America: Bigfoot in Argentina
(5, 2, 'Bariloche, Argentina', 'Bipedal creature seen at tree line during snowfall.', 88, '2024-03-10',
    ST_SetSRID(ST_MakePoint(-71.3082, -41.1335), 4326)),

-- Antarctica: Alien sighting
(2, 4, 'McMurdo Station, Antarctica', 'Unidentified being captured briefly on thermal cam.', 54, '2024-02-05',
    ST_SetSRID(ST_MakePoint(166.6667, -77.8419), 4326)),

-- Japan (Ghost)
(3, 1, 'Aokigahara Forest, Japan', 'White figure with no feet seen floating through the forest.', 66, '2024-03-21',
    ST_SetSRID(ST_MakePoint(138.6846, 35.4876), 4326)),

-- Iceland (Dragon)
(4, 3, 'Lake Lagarfljót, Iceland', 'Serpentine creature glimpsed below icy lake surface.', 280, '2024-02-18',
    ST_SetSRID(ST_MakePoint(-14.3666, 65.0833), 4326)),

-- Nigeria (Alien)
(5, 4, 'Obudu Plateau, Nigeria', 'Small glowing being observed hovering near mountain huts.', 50, '2024-01-22',
    ST_SetSRID(ST_MakePoint(9.3612, 6.3793), 4326)),

-- Germany (Ghost)
(1, 1, 'Heidelberg Castle, Germany', 'Spectral horse and rider galloped across the courtyard.', 74, '2024-03-02',
    ST_SetSRID(ST_MakePoint(8.7156, 49.4100), 4326)),

-- Peru (Bigfoot/Yeti)
(2, 2, 'Andes Mountains, Peru', 'Large humanoid with fur spotted trekking snowy slope.', 98, '2024-03-16',
    ST_SetSRID(ST_MakePoint(-72.0000, -13.5000), 4326)),

-- South Korea (Alien)
(3, 4, 'Jeju Island, South Korea', 'Metallic disc seen above forest—figure dropped silently.', 53, '2024-02-09',
    ST_SetSRID(ST_MakePoint(126.5312, 33.4996), 4326)),

-- Ukraine (Dragon)
(4, 3, 'Carpathian Mountains, Ukraine', 'Flaming trail in sky—winged shape briefly visible.', 240, '2024-03-12',
    ST_SetSRID(ST_MakePoint(24.0000, 48.1500), 4326)),

-- Indonesia (Ghost)
(5, 1, 'Borobudur Temple, Indonesia', 'Shadowy woman with no face drifting between stupas.', 64, '2024-01-29',
    ST_SetSRID(ST_MakePoint(110.2038, -7.6079), 4326)),

-- Greenland (Alien)
(1, 4, 'Kangerlussuaq, Greenland', 'Bright green object landed silently in snowfield.', 49, '2024-03-08',
    ST_SetSRID(ST_MakePoint(-50.6833, 67.0167), 4326)),

-- India (Bigfoot/Yeti)
(2, 2, 'Himalayas near Ladakh, India', 'Massive prints in snow followed by deep growling sounds.', 92, '2024-02-27',
    ST_SetSRID(ST_MakePoint(77.5833, 34.1526), 4326));


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
