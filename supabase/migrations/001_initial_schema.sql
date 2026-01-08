-- Kindr Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE gender AS ENUM ('M', 'F', 'U');
CREATE TYPE country AS ENUM ('BR', 'US');
CREATE TYPE swipe_decision AS ENUM ('like', 'dislike');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{
    "countries": ["BR", "US"],
    "gender": null,
    "excluded_letters": [],
    "avoid_common": false,
    "avoid_rare": false
  }'::jsonb
);

-- Couples table
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invite_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Names table
CREATE TABLE public.names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender gender NOT NULL,
  country country NOT NULL,
  origin TEXT,
  meaning TEXT,
  popularity_rank INTEGER,
  registration_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, gender, country)
);

-- Swipes table
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  decision swipe_decision NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  is_favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id, name_id)
);

-- Indexes for performance
CREATE INDEX idx_names_country ON public.names(country);
CREATE INDEX idx_names_gender ON public.names(gender);
CREATE INDEX idx_names_country_gender ON public.names(country, gender);
CREATE INDEX idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX idx_swipes_name_id ON public.swipes(name_id);
CREATE INDEX idx_matches_couple_id ON public.matches(couple_id);
CREATE INDEX idx_couples_invite_code ON public.couples(invite_code);
CREATE INDEX idx_couples_user_1 ON public.couples(user_1_id);
CREATE INDEX idx_couples_user_2 ON public.couples(user_2_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.names ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Couples policies
CREATE POLICY "Users can view their couples" ON public.couples
  FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

CREATE POLICY "Users can create couples" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() = user_1_id);

CREATE POLICY "Users can update their couples" ON public.couples
  FOR UPDATE USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Anyone can view couple by invite code (for joining)
CREATE POLICY "Anyone can view couple by invite code" ON public.couples
  FOR SELECT USING (invite_code IS NOT NULL);

-- Names policies (public read)
CREATE POLICY "Anyone can view names" ON public.names
  FOR SELECT TO authenticated USING (true);

-- Swipes policies
CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches for their couples" ON public.matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE couples.id = matches.couple_id
      AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create matches for their couples" ON public.matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE couples.id = couple_id
      AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update matches for their couples" ON public.matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE couples.id = matches.couple_id
      AND (couples.user_1_id = auth.uid() OR couples.user_2_id = auth.uid())
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check for matches after a swipe
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER AS $$
DECLARE
  partner_id UUID;
  couple_record RECORD;
  partner_liked BOOLEAN;
BEGIN
  -- Only check if the swipe is a "like"
  IF NEW.decision != 'like' THEN
    RETURN NEW;
  END IF;

  -- Find the couple this user belongs to
  SELECT * INTO couple_record
  FROM public.couples
  WHERE (user_1_id = NEW.user_id OR user_2_id = NEW.user_id)
    AND user_2_id IS NOT NULL
  LIMIT 1;

  -- If no couple found or partner not joined, skip
  IF couple_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine the partner's ID
  IF couple_record.user_1_id = NEW.user_id THEN
    partner_id := couple_record.user_2_id;
  ELSE
    partner_id := couple_record.user_1_id;
  END IF;

  -- Check if partner also liked this name
  SELECT EXISTS (
    SELECT 1 FROM public.swipes
    WHERE user_id = partner_id
      AND name_id = NEW.name_id
      AND decision = 'like'
  ) INTO partner_liked;

  -- If both liked, create a match!
  IF partner_liked THEN
    INSERT INTO public.matches (couple_id, name_id)
    VALUES (couple_record.id, NEW.name_id)
    ON CONFLICT (couple_id, name_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for match detection
CREATE TRIGGER on_swipe_check_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.check_for_match();

-- Function to generate invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
