CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    bio VARCHAR(160),
    keyboard_layout VARCHAR(20) DEFAULT 'qwerty',
    theme_preference VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wpm INTEGER NOT NULL,
    raw_wpm INTEGER NOT NULL,
    accuracy DECIMAL(5, 2) NOT NULL,
    consistency DECIMAL(5, 2),
    error_count INTEGER DEFAULT 0,
    mode VARCHAR(50) NOT NULL, -- e.g., 'time_60', 'words_50', 'quote'
    language VARCHAR(50) DEFAULT 'english',
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_matches_mode ON matches(mode);
