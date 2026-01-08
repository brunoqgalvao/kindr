export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      couples: {
        Row: {
          id: string;
          user_1_id: string;
          user_2_id: string | null;
          invite_code: string;
          invite_expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_1_id: string;
          user_2_id?: string | null;
          invite_code: string;
          invite_expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_1_id?: string;
          user_2_id?: string | null;
          invite_code?: string;
          invite_expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couples_user_1_id_fkey';
            columns: ['user_1_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couples_user_2_id_fkey';
            columns: ['user_2_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      preferences: {
        Row: {
          id: string;
          couple_id: string;
          country: 'BR' | 'US' | 'BOTH';
          gender: 'M' | 'F' | 'BOTH';
          excluded_letters: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          country?: 'BR' | 'US' | 'BOTH';
          gender?: 'M' | 'F' | 'BOTH';
          excluded_letters?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          country?: 'BR' | 'US' | 'BOTH';
          gender?: 'M' | 'F' | 'BOTH';
          excluded_letters?: string[] | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'preferences_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: true;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          }
        ];
      };
      names: {
        Row: {
          id: string;
          name: string;
          gender: 'M' | 'F' | 'U';
          country: 'BR' | 'US';
          origin: string | null;
          meaning: string | null;
          popularity_rank: number | null;
          registration_count: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          gender: 'M' | 'F' | 'U';
          country: 'BR' | 'US';
          origin?: string | null;
          meaning?: string | null;
          popularity_rank?: number | null;
          registration_count?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          gender?: 'M' | 'F' | 'U';
          country?: 'BR' | 'US';
          origin?: string | null;
          meaning?: string | null;
          popularity_rank?: number | null;
          registration_count?: number | null;
        };
        Relationships: [];
      };
      swipes: {
        Row: {
          id: string;
          user_id: string;
          name_id: string;
          decision: 'like' | 'dislike';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name_id: string;
          decision: 'like' | 'dislike';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name_id?: string;
          decision?: 'like' | 'dislike';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'swipes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'swipes_name_id_fkey';
            columns: ['name_id'];
            isOneToOne: false;
            referencedRelation: 'names';
            referencedColumns: ['id'];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          couple_id: string;
          name_id: string;
          is_favorited: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          name_id: string;
          is_favorited?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          name_id?: string;
          is_favorited?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couples';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_name_id_fkey';
            columns: ['name_id'];
            isOneToOne: false;
            referencedRelation: 'names';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      country_type: 'BR' | 'US' | 'BOTH';
      gender_type: 'M' | 'F' | 'U';
      preference_gender_type: 'M' | 'F' | 'BOTH';
      decision_type: 'like' | 'dislike';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type exports
export type Profile = Tables<'profiles'>;
export type Couple = Tables<'couples'>;
export type Preferences = Tables<'preferences'>;
export type Name = Tables<'names'>;
export type Swipe = Tables<'swipes'>;
export type Match = Tables<'matches'>;

export type InsertProfile = InsertTables<'profiles'>;
export type InsertCouple = InsertTables<'couples'>;
export type InsertPreferences = InsertTables<'preferences'>;
export type InsertName = InsertTables<'names'>;
export type InsertSwipe = InsertTables<'swipes'>;
export type InsertMatch = InsertTables<'matches'>;

export type UpdateProfile = UpdateTables<'profiles'>;
export type UpdateCouple = UpdateTables<'couples'>;
export type UpdatePreferences = UpdateTables<'preferences'>;
export type UpdateName = UpdateTables<'names'>;
export type UpdateSwipe = UpdateTables<'swipes'>;
export type UpdateMatch = UpdateTables<'matches'>;
