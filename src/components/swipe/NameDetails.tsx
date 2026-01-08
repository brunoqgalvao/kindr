'use client';

import { motion } from 'framer-motion';
import { X, Heart, ThumbsDown, TrendingUp } from 'lucide-react';
import type { Name } from '@/types/database';

interface NameDetailsProps {
  name: Name;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
}

export function NameDetails({ name, onClose, onLike, onDislike }: NameDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-[var(--foreground-muted)]" />
        </button>

        {/* Name header */}
        <div className="text-center mb-6">
          <span className="text-2xl mb-2 block">
            {name.country === 'BR' ? '🇧🇷' : '🇺🇸'}
          </span>
          <h2 className="text-4xl font-bold text-[var(--foreground)]">{name.name}</h2>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[var(--background)] text-sm font-medium text-[var(--foreground-muted)]">
            {name.gender === 'M' ? '👦 Boy' : name.gender === 'F' ? '👧 Girl' : '🌟 Unisex'}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-8">
          {name.origin && (
            <div className="bg-[var(--background)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">
                📖 Origin
              </h3>
              <p className="text-[var(--foreground)]">{name.origin}</p>
            </div>
          )}

          {name.meaning && (
            <div className="bg-[var(--background)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">
                ✨ Meaning
              </h3>
              <p className="text-[var(--foreground)]">{name.meaning}</p>
            </div>
          )}

          {name.popularity_rank && (
            <div className="bg-[var(--background)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popularity
              </h3>
              <p className="text-[var(--foreground)]">
                #{name.popularity_rank} in {name.country === 'BR' ? 'Brazil' : 'USA'}
                {name.registration_count && (
                  <span className="text-[var(--foreground-muted)] ml-2">
                    ({name.registration_count.toLocaleString()} registrations)
                  </span>
                )}
              </p>
            </div>
          )}

          {!name.origin && !name.meaning && !name.popularity_rank && (
            <div className="bg-[var(--background)] rounded-xl p-4 text-center">
              <p className="text-[var(--foreground-muted)]">
                More details coming soon!
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={onDislike}
            className="w-16 h-16 rounded-full bg-white border-2 border-[var(--dislike)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <ThumbsDown className="h-7 w-7 text-[var(--dislike)]" />
          </button>
          <button
            onClick={onLike}
            className="w-16 h-16 rounded-full bg-[var(--like)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart className="h-7 w-7 text-white fill-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
