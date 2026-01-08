import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Country, Gender, UserPreferences } from '@/types';

interface UserState {
  userId: string | null;
  email: string | null;
  preferences: UserPreferences;
  coupleId: string | null;
  partnerId: string | null;
  hasCompletedOnboarding: boolean;

  // Actions
  setUser: (userId: string, email: string) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setCouple: (coupleId: string, partnerId: string | null) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  countries: ['BR', 'US'],
  gender: null,
  excluded_letters: [],
  avoid_common: false,
  avoid_rare: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      preferences: defaultPreferences,
      coupleId: null,
      partnerId: null,
      hasCompletedOnboarding: false,

      setUser: (userId, email) => set({ userId, email }),

      setPreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      setCouple: (coupleId, partnerId) => set({ coupleId, partnerId }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      reset: () =>
        set({
          userId: null,
          email: null,
          preferences: defaultPreferences,
          coupleId: null,
          partnerId: null,
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: 'kindr-user-storage',
    }
  )
);
