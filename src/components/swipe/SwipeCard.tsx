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
        <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
          {/* Country flag */}
          <span className="text-3xl mb-4">
            {name.country === 'BR' ? '🇧🇷' : '🇺🇸'}
          </span>

          {/* Name */}
          <h2 className="text-5xl font-bold text-[var(--foreground)] mb-4 text-center">
            {name.name}
          </h2>

          {/* Gender badge */}
          <span className="px-3 py-1 rounded-full bg-[var(--background)] text-sm font-medium text-[var(--foreground-muted)]">
            {name.gender === 'M' ? '👦 Boy' : name.gender === 'F' ? '👧 Girl' : '🌟 Unisex'}
          </span>

          {/* Tap for more info */}
          <div className="mt-8 flex items-center gap-2 text-[var(--foreground-muted)]">
            <Info className="h-4 w-4" />
            <span className="text-sm">Tap for details</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
