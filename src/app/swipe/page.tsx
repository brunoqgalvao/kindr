'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Settings, Heart, ThumbsDown, RefreshCw } from 'lucide-react';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { NameDetails } from '@/components/swipe/NameDetails';
import { MatchCelebration } from '@/components/swipe/MatchCelebration';
import { BottomNav } from '@/components/ui/BottomNav';
import type { Name } from '@/types/database';

export default function SwipePage() {
  const [names, setNames] = useState<Name[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const router = useRouter();

  const currentName = names[currentIndex];

  const fetchNames = useCallback(async () => {
    setLoading(true);
    try {
      // Get preferences first
      const prefsRes = await fetch('/api/preferences');
      const prefsData = await prefsRes.json();
      const prefs = prefsData.preferences;

      // Build query params
      const params = new URLSearchParams();
      if (prefs?.country) params.set('country', prefs.country);
      if (prefs?.gender) params.set('gender', prefs.gender);
      if (prefs?.excluded_letters?.length) {
        params.set('excluded', prefs.excluded_letters.join(','));
      }

      const res = await fetch(`/api/names?${params}`);
      const data = await res.json();
      setNames(data.names || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching names:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatchCount = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatchCount(data.matches?.length || 0);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  useEffect(() => {
    fetchNames();
    fetchMatchCount();
  }, [fetchNames]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentName) return;

    const decision = direction === 'right' ? 'like' : 'dislike';

    try {
      const res = await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameId: currentName.id,
          decision,
        }),
      });

      const data = await res.json();

      // Check if it's a match
      if (data.match) {
        setMatchedName(currentName.name);
        setMatchCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    // Move to next name
    setCurrentIndex((prev) => prev + 1);
    setShowDetails(false);
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">Loading names...</p>
        </div>
      </div>
    );
  }

  const isOutOfNames = currentIndex >= names.length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/settings')}
          className="p-2 rounded-full hover:bg-white/50"
        >
          <Settings className="h-6 w-6 text-[var(--foreground)]" />
        </button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Kindr</h1>
        <button
          onClick={() => router.push('/matches')}
          className="relative p-2 rounded-full hover:bg-white/50"
        >
          <Heart className="h-6 w-6 text-[var(--primary)] fill-[var(--primary)]" />
          {matchCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {matchCount}
            </span>
          )}
        </button>
      </header>

      {/* Main swipe area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {isOutOfNames ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              You&apos;ve seen all names!
            </h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              Check your matches or adjust your preferences to see more.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/matches')}
                className="w-full py-3 px-6 bg-[var(--primary)] text-white font-semibold rounded-xl"
              >
                View Matches ({matchCount})
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="w-full py-3 px-6 bg-white text-[var(--foreground)] font-semibold rounded-xl"
              >
                Adjust Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-sm h-[450px] flex items-center justify-center">
            <AnimatePresence>
              {currentName && (
                <SwipeCard
                  key={currentName.id}
                  name={currentName}
                  onSwipe={handleSwipe}
                  onTap={() => setShowDetails(true)}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        {!isOutOfNames && currentName && (
          <div className="flex justify-center gap-8 mt-8">
            <button
              onClick={() => handleButtonSwipe('left')}
              className="w-16 h-16 rounded-full bg-white border-2 border-[var(--dislike)] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              <ThumbsDown className="h-7 w-7 text-[var(--dislike)]" />
            </button>
            <button
              onClick={() => handleButtonSwipe('right')}
              className="w-16 h-16 rounded-full bg-[var(--like)] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              <Heart className="h-7 w-7 text-white fill-white" />
            </button>
          </div>
        )}
      </main>

      {/* Name details modal */}
      <AnimatePresence>
        {showDetails && currentName && (
          <NameDetails
            name={currentName}
            onClose={() => setShowDetails(false)}
            onLike={() => handleSwipe('right')}
            onDislike={() => handleSwipe('left')}
          />
        )}
      </AnimatePresence>

      {/* Match celebration */}
      <AnimatePresence>
        {matchedName && (
          <MatchCelebration
            matchedName={matchedName}
            onContinue={() => setMatchedName(null)}
            onViewMatches={() => router.push('/matches')}
          />
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
