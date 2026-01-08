import { create } from 'zustand';
import type { Name, Match } from '@/types';

interface SwipeState {
  names: Name[];
  currentIndex: number;
  matches: Match[];
  isLoading: boolean;
  showMatch: Match | null;

  // Actions
  setNames: (names: Name[]) => void;
  nextName: () => void;
  addMatch: (match: Match) => void;
  setMatches: (matches: Match[]) => void;
  setLoading: (loading: boolean) => void;
  showMatchCelebration: (match: Match) => void;
  hideMatchCelebration: () => void;
  reset: () => void;
}

export const useSwipeStore = create<SwipeState>((set) => ({
  names: [],
  currentIndex: 0,
  matches: [],
  isLoading: true,
  showMatch: null,

  setNames: (names) => set({ names, currentIndex: 0, isLoading: false }),

  nextName: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.names.length),
    })),

  addMatch: (match) =>
    set((state) => ({
      matches: [match, ...state.matches],
    })),

  setMatches: (matches) => set({ matches }),

  setLoading: (isLoading) => set({ isLoading }),

  showMatchCelebration: (match) => set({ showMatch: match }),

  hideMatchCelebration: () => set({ showMatch: null }),

  reset: () =>
    set({
      names: [],
      currentIndex: 0,
      matches: [],
      isLoading: true,
      showMatch: null,
    }),
}));
