'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Trash2, RefreshCw } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';

interface Match {
  id: string;
  name_id: string;
  is_favorited: boolean;
  created_at: string;
  names: {
    id: string;
    name: string;
    gender: 'M' | 'F' | 'U';
    country: 'BR' | 'US';
    origin: string | null;
    meaning: string | null;
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (matchId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          isFavorited: !currentStatus,
        }),
      });

      if (res.ok) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, is_favorited: !currentStatus } : m
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const removeMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches?id=${matchId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      }
    } catch (error) {
      console.error('Error removing match:', error);
    }
  };

  const sortedMatches = [...matches].sort((a, b) => {
    // Favorites first
    if (a.is_favorited && !b.is_favorited) return -1;
    if (!a.is_favorited && b.is_favorited) return 1;
    // Then by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Your Matches
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {matches.length === 0
            ? 'No matches yet - keep swiping!'
            : `${matches.length} name${matches.length === 1 ? '' : 's'} you both love`}
        </p>
      </header>

      {/* Matches list */}
      <main className="px-4">
        {matches.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              No matches yet
            </h2>
            <p className="text-[var(--foreground-muted)]">
              When you and your partner both like the same name, it&apos;ll appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  {/* Country flag */}
                  <span className="text-2xl">
                    {match.names.country === 'BR' ? '🇧🇷' : '🇺🇸'}
                  </span>

                  {/* Name info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--foreground)]">
                        {match.names.name}
                      </h3>
                      {match.is_favorited && (
                        <Star className="h-4 w-4 text-[var(--success)] fill-[var(--success)]" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {match.names.gender === 'M'
                        ? '👦 Boy'
                        : match.names.gender === 'F'
                        ? '👧 Girl'
                        : '🌟 Unisex'}
                      {match.names.meaning && ` · ${match.names.meaning}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(match.id, match.is_favorited)}
                      className={`p-2 rounded-full transition-colors ${
                        match.is_favorited
                          ? 'bg-[var(--success)]/10 text-[var(--success)]'
                          : 'bg-gray-100 text-gray-400 hover:text-[var(--success)]'
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 ${match.is_favorited ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => removeMatch(match.id)}
                      className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-[var(--dislike)] transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
