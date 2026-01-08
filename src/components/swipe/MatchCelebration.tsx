'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchCelebrationProps {
  matchedName: string;
  onContinue: () => void;
  onViewMatches: () => void;
}

export function MatchCelebration({ matchedName, onContinue, onViewMatches }: MatchCelebrationProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#FF6B9D', '#9B59B6', '#FFD700', '#4CAF50', '#FF6B6B'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] overflow-hidden"
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute top-0 w-3 h-3 rounded-full"
          style={{ left: `${c.x}%`, backgroundColor: c.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 720,
          }}
          transition={{
            duration: 3,
            delay: c.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="text-center px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <Heart className="h-24 w-24 text-white fill-white" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-[var(--success)]" />
            <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-[var(--success)]" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-white mb-4"
        >
          It&apos;s a Match!
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/20 backdrop-blur rounded-2xl px-8 py-6 mb-8"
        >
          <p className="text-white/80 text-sm mb-2">You both love</p>
          <p className="text-4xl font-bold text-white">{matchedName}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 w-full max-w-xs mx-auto"
        >
          <Button
            onClick={onViewMatches}
            className="w-full bg-white text-[var(--primary)] hover:bg-white/90"
            size="lg"
          >
            View All Matches
          </Button>
          <Button
            onClick={onContinue}
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
            size="lg"
          >
            Keep Swiping
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
