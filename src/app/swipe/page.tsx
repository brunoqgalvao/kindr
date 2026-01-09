'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Settings, Heart, ThumbsDown, RefreshCw, UserPlus } from 'lucide-react';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { NameDetails } from '@/components/swipe/NameDetails';
import { MatchCelebration } from '@/components/swipe/MatchCelebration';
import { BottomNav } from '@/components/ui/BottomNav';
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches';
import type { Name } from '@/types/database';

export default function SwipePage() {
  const [names, setNames] = useState<Name[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreNames, setHasMoreNames] = useState(true);
  const router = useRouter();

  const currentName = names[currentIndex];

  // Handle realtime match notifications from partner
  const handleRealtimeMatch = useCallback(async (match: { name_id: string }) => {
    // Only show if we didn't trigger this match ourselves (partner triggered it)
    // We check by seeing if the current name matches - if so, we already showed it
    if (currentName && match.name_id === currentName.id) {
      return; // Already handled by our own swipe
    }

    // Fetch the name details for the matched name
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        const latestMatch = data.matches?.find((m: { name_id: string }) => m.name_id === match.name_id);
        if (latestMatch?.names?.name) {
          setMatchedName(latestMatch.names.name);
          setMatchCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching matched name:', error);
      setMatchCount((prev) => prev + 1);
    }
  }, [currentName]);

  // Subscribe to realtime match updates
  useRealtimeMatches({
    coupleId,
    onNewMatch: handleRealtimeMatch,
    enabled: !!coupleId,
  });

  // Fetch couple info for realtime subscription and partner status
  const fetchCoupleInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/couples');
      const data = await res.json();
      if (data.couple?.id) {
        setCoupleId(data.couple.id);
        setHasPartner(!!data.couple.user_2_id);
      } else {
        setHasPartner(false);
      }
    } catch (error) {
      console.error('Error fetching couple info:', error);
      setHasPartner(false);
    }
  }, []);

  const fetchNames = useCallback(async (append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

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
      params.set('limit', '50');

      const res = await fetch(`/api/names?${params}`);
      const data = await res.json();
      const newNames = data.names || [];

      if (newNames.length === 0) {
        setHasMoreNames(false);
      }

      if (append) {
        setNames(prev => [...prev, ...newNames]);
      } else {
        setNames(newNames);
        setCurrentIndex(0);
        setHasMoreNames(newNames.length > 0);
      }
    } catch (error) {
      console.error('Error fetching names:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
    fetchCoupleInfo();
  }, [fetchNames, fetchCoupleInfo]);

  // Load more names when approaching the end of the list
  useEffect(() => {
    const remainingNames = names.length - currentIndex;
    if (remainingNames <= 10 && !loadingMore && hasMoreNames) {
      fetchNames(true);
    }
  }, [currentIndex, names.length, loadingMore, hasMoreNames, fetchNames]);

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

  const isOutOfNames = currentIndex >= names.length && !hasMoreNames;

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
        <div className="flex items-center gap-2">
          {hasPartner === false && (
            <button
              onClick={() => router.push('/invite')}
              className="relative p-2 rounded-full hover:bg-white/50"
            >
              <UserPlus className="h-6 w-6 text-[var(--secondary)]" />
              <span className="absolute -top-1 -right-1 bg-[var(--secondary)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                !
              </span>
            </button>
          )}
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
        </div>
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
            {loadingMore && (
              <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-[var(--foreground-muted)]">
                Loading more names...
              </div>
            )}
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
