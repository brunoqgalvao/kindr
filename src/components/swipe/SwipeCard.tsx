'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Info } from 'lucide-react';
import type { Name } from '@/types/database';

interface SwipeCardProps {
  name: Name;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap: () => void;
}

export function SwipeCard({ name, onSwipe, onTap }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Like/Nope indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(300);
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        onClick={onTap}
        className="relative bg-white rounded-3xl shadow-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Like indicator */}
        <motion.div
          className="absolute top-6 right-6 z-10 px-4 py-2 rounded-lg border-4 border-[var(--like)] rotate-12"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-2xl font-bold text-[var(--like)]">LIKE</span>
        </motion.div>

        {/* Nope indicator */}
        <motion.div
          className="absolute top-6 left-6 z-10 px-4 py-2 rounded-lg border-4 border-[var(--dislike)] -rotate-12"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-2xl font-bold text-[var(--dislike)]">NOPE</span>
        </motion.div>

        {/* Card content */}
        <div className="p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-4 left-4 text-6xl">👶</div>
            <div className="absolute top-8 right-8 text-4xl">✨</div>
            <div className="absolute bottom-12 left-8 text-5xl">💕</div>
            <div className="absolute bottom-6 right-6 text-4xl">🌟</div>
          </div>

          {/* Gradient accent at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]" />

          {/* Country flag */}
          <div className="relative mb-6">
            <span className="text-5xl drop-shadow-lg animate-float">
              {name.country === 'BR' ? '🇧🇷' : '🇺🇸'}
            </span>
          </div>

          {/* Name */}
          <h2 className="text-6xl font-bold text-gradient mb-6 text-center tracking-tight">
            {name.name}
          </h2>

          {/* Gender badge */}
          <span className={`px-5 py-2 rounded-full text-base font-semibold shadow-md ${
            name.gender === 'M'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
              : name.gender === 'F'
              ? 'bg-pink-100 text-pink-700 border-2 border-pink-200'
              : 'bg-purple-100 text-purple-700 border-2 border-purple-200'
          }`}>
            {name.gender === 'M' ? '👦 Boy' : name.gender === 'F' ? '👧 Girl' : '🌟 Unisex'}
          </span>

          {/* Tap for more info */}
          <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--primary-light)] text-[var(--primary-dark)] hover:bg-[var(--primary-light)] hover:text-white transition-all">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Tap for details</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
