export type Gender = 'M' | 'F' | 'U';
export type Country = 'BR' | 'US';
export type SwipeDecision = 'like' | 'dislike';

export interface Name {
  id: string;
  name: string;
  gender: Gender;
  country: Country;
  origin: string | null;
  meaning: string | null;
  popularity_rank: number | null;
  registration_count: number | null;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  countries: Country[];
  gender: Gender | null;
  excluded_letters: string[];
  avoid_common: boolean;
  avoid_rare: boolean;
}

export interface Couple {
  id: string;
  user_1_id: string;
  user_2_id: string | null;
  invite_code: string;
  invite_expires_at: string;
  created_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  name_id: string;
  decision: SwipeDecision;
  created_at: string;
}

export interface Match {
  id: string;
  couple_id: string;
  name_id: string;
  is_favorited: boolean;
  created_at: string;
  name?: Name;
}
