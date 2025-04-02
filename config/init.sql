-- Ensure enum types are only created if they do not already exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Captain', 'Player');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('Pending', 'Active', 'Inactive');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('Upcoming', 'Live', 'Completed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('Pending', 'Completed', 'Failed');
    END IF;
END $$;

-- Drop existing tables if needed (optional, use only if resetting the DB)
DROP TABLE IF EXISTS team_players, match_teams, match_scores, transactions, teams, matches, users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  password TEXT NOT NULL,
  unique_id TEXT UNIQUE NOT NULL,
  subscription_status subscription_status DEFAULT 'Inactive',
  subscription_expiry_date TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  captain_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  jersey_numbers INTEGER[],
  removal_requested INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Create team_players junction table
CREATE TABLE IF NOT EXISTS team_players (
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, player_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  status match_status NOT NULL
);

-- Create match_teams junction table
CREATE TABLE IF NOT EXISTS match_teams (
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (match_id, team_id)
);

-- Create match_scores table
CREATE TABLE IF NOT EXISTS match_scores (
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, team_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  captain_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status transaction_status NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_unique_id ON users(unique_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_transactions_captain ON transactions(captain_id);
