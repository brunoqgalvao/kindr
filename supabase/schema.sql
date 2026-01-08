-- Kindr Database Schema
-- Baby name matching app for couples

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE country_type AS ENUM ('BR', 'US');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'U');
CREATE TYPE preference_country_type AS ENUM ('BR', 'US', 'BOTH');
CREATE TYPE preference_gender_type AS ENUM ('M', 'F', 'BOTH');
CREATE TYPE decision_type AS ENUM ('like', 'dislike');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Couples table
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code TEXT NOT NULL UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preferences table (per couple)
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  country preference_country_type NOT NULL DEFAULT 'BOTH',
  gender preference_gender_type NOT NULL DEFAULT 'BOTH',
  excluded_letters TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Names table (read-only reference data)
CREATE TABLE names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender gender_type NOT NULL,
  country country_type NOT NULL,
  origin TEXT,
  meaning TEXT,
  popularity_rank INTEGER,
  registration_count INTEGER
);

-- Swipes table (individual user decisions)
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES names(id) ON DELETE CASCADE,
  decision decision_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

-- Matches table (names both partners liked)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES names(id) ON DELETE CASCADE,
  is_favorited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(couple_id, name_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Couples
CREATE INDEX idx_couples_user_1_id ON couples(user_1_id);
CREATE INDEX idx_couples_user_2_id ON couples(user_2_id);
CREATE INDEX idx_couples_invite_code ON couples(invite_code);
CREATE INDEX idx_couples_created_at ON couples(created_at);

-- Preferences
CREATE INDEX idx_preferences_couple_id ON preferences(couple_id);

-- Names
CREATE INDEX idx_names_gender ON names(gender);
CREATE INDEX idx_names_country ON names(country);
CREATE INDEX idx_names_gender_country ON names(gender, country);
CREATE INDEX idx_names_popularity_rank ON names(popularity_rank);
CREATE INDEX idx_names_name_lower ON names(LOWER(name));

-- Swipes
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_name_id ON swipes(name_id);
CREATE INDEX idx_swipes_user_decision ON swipes(user_id, decision);
CREATE INDEX idx_swipes_created_at ON swipes(created_at);

-- Matches
CREATE INDEX idx_matches_couple_id ON matches(couple_id);
CREATE INDEX idx_matches_name_id ON matches(name_id);
CREATE INDEX idx_matches_couple_favorited ON matches(couple_id, is_favorited);
CREATE INDEX idx_matches_created_at ON matches(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE names ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view their partner's profile
CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE (couples.user_1_id = auth.uid() AND couples.user_2_id = profiles.id)
         OR (couples.user_2_id = auth.uid() AND couples.user_1_id = profiles.id)
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- COUPLES POLICIES
-- ============================================

-- Users can view couples they belong to
CREATE POLICY "Users can view own couples"
  ON couples FOR SELECT
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Users can create a couple (as user_1)
CREATE POLICY "Users can create couple"
  ON couples FOR INSERT
  WITH CHECK (auth.uid() = user_1_id);

-- User 1 can update their couple (for invite regeneration)
CREATE POLICY "User 1 can update couple"
  ON couples FOR UPDATE
  USING (auth.uid() = user_1_id)
  WITH CHECK (auth.uid() = user_1_id);

-- Allow joining a couple via invite code (user_2 joining)
CREATE POLICY "Users can join couple via invite"
  ON couples FOR UPDATE
  USING (
    user_2_id IS NULL
    AND invite_expires_at > NOW()
    AND auth.uid() != user_1_id
  )
  WITH CHECK (
    auth.uid() = user_2_id
  );

-- User 1 can delete the couple
CREATE POLICY "User 1 can delete couple"
  ON couples FOR DELETE
  USING (auth.uid() = user_1_id);

-- ============================================
-- PREFERENCES POLICIES
-- ============================================

-- Users can view preferences for their couple
CREATE POLICY "Users can view own couple preferences"
  ON preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = preferences.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- User 1 can create preferences for their couple
CREATE POLICY "User 1 can create couple preferences"
  ON preferences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = preferences.couple_id
        AND couples.user_1_id = auth.uid()
    )
  );

-- Both users can update preferences for their couple
CREATE POLICY "Users can update own couple preferences"
  ON preferences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = preferences.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = preferences.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- ============================================
-- NAMES POLICIES
-- ============================================

-- Everyone can read names (public reference data)
CREATE POLICY "Names are publicly readable"
  ON names FOR SELECT
  USING (true);

-- Only service role can insert/update/delete names
-- (No policies for INSERT/UPDATE/DELETE means only service role can do it)

-- ============================================
-- SWIPES POLICIES
-- ============================================

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own swipes
CREATE POLICY "Users can create own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own swipes (change decision)
CREATE POLICY "Users can update own swipes"
  ON swipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own swipes
CREATE POLICY "Users can delete own swipes"
  ON swipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MATCHES POLICIES
-- ============================================

-- Users can view matches for their couple
CREATE POLICY "Users can view own couple matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- Matches are created by triggers/functions, but allow insert for couple members
CREATE POLICY "Users can create matches for own couple"
  ON matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- Users can update matches (toggle favorite) for their couple
CREATE POLICY "Users can update own couple matches"
  ON matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- Users can delete matches for their couple
CREATE POLICY "Users can delete own couple matches"
  ON matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = matches.couple_id
        AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if a name is a match (both users liked it)
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER AS $$
DECLARE
  v_couple_id UUID;
  v_partner_id UUID;
  v_partner_liked BOOLEAN;
BEGIN
  -- Only check on 'like' decisions
  IF NEW.decision != 'like' THEN
    RETURN NEW;
  END IF;

  -- Find the couple this user belongs to
  SELECT id,
         CASE WHEN user_1_id = NEW.user_id THEN user_2_id ELSE user_1_id END
  INTO v_couple_id, v_partner_id
  FROM couples
  WHERE (user_1_id = NEW.user_id OR user_2_id = NEW.user_id)
    AND user_2_id IS NOT NULL
  LIMIT 1;

  -- If no couple found or no partner yet, skip
  IF v_couple_id IS NULL OR v_partner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if partner also liked this name
  SELECT EXISTS (
    SELECT 1 FROM swipes
    WHERE user_id = v_partner_id
      AND name_id = NEW.name_id
      AND decision = 'like'
  ) INTO v_partner_liked;

  -- If both liked, create a match
  IF v_partner_liked THEN
    INSERT INTO matches (couple_id, name_id)
    VALUES (v_couple_id, NEW.name_id)
    ON CONFLICT (couple_id, name_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check for matches after a swipe
CREATE OR REPLACE TRIGGER on_swipe_check_match
  AFTER INSERT OR UPDATE ON swipes
  FOR EACH ROW EXECUTE FUNCTION public.check_for_match();

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
