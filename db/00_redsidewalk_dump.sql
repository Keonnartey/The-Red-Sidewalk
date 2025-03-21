-- Ensure the database exists, create it if it doesn't
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'redsidewalk') THEN
        CREATE DATABASE redsidewalk;
    END IF;
END
$$;

-- Connect to the database
\c redsidewalk;

-- Ensure the user exists, create it if it doesn't
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'redsidewalk_user') THEN
        CREATE ROLE redsidewalk_user WITH LOGIN PASSWORD 'securepassword';
        GRANT ALL PRIVILEGES ON DATABASE redsidewalk TO redsidewalk_user;
    END IF;
END
$$;

-- Create the tables (if they don't already exist)
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    user_address VARCHAR NOT NULL, 
    about_me TEXT,
    birthday DATE NOT NULL, 
    created_at TIMESTAMP NOT NULL, 
    profile_pic VARCHAR
);

-- Sample insert statement
INSERT INTO users (user_id, full_name, user_address, birthday, created_at) VALUES (1, 'abcdef', '1234 main st', '1999-01-01', '2024-01-01 00:00:00')
ON CONFLICT (user_id) DO NOTHING;  -- Prevents errors if the user already exists


