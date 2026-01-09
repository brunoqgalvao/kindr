'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading text */
  text?: string;
  /** Full screen overlay mode */
  fullScreen?: boolean;
  /** Custom className */
  className?: string;
}

export function Loading({
  size = 'md',
  text,
  fullScreen = false,
  className
}: LoadingProps) {
  const sizes = {
    sm: { hearts: 16, gap: 6, text: 'text-sm' },
    md: { hearts: 24, gap: 8, text: 'text-base' },
    lg: { hearts: 32, gap: 10, text: 'text-lg' },
  };

  const config = sizes[size];

  const heartVariants = {
    animate: (i: number) => ({
      y: [0, -12, 0],
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.15,
        ease: 'easeInOut' as const,
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
  };

  const content = (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Bouncing Hearts */}
      <div
        className="flex items-end"
        style={{ gap: config.gap }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={heartVariants}
            animate="animate"
            className="relative"
          >
            <Heart
              size={config.hearts}
              className={cn(
                'fill-current',
                i === 0 && 'text-primary',
                i === 1 && 'text-secondary',
                i === 2 && 'text-primary-light'
              )}
            />
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-success rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3 + 0.4,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Loading text */}
      {text && (
        <motion.p
          className={cn(
            'mt-4 font-display font-semibold text-gradient',
            config.text
          )}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Cute dot spinner variant
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Sparkly ring loader
export function LoadingRing({
  size = 40,
  className
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Outer spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: 'var(--primary)',
          borderRightColor: 'var(--primary-light)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Inner pulsing heart */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Heart
          size={size * 0.4}
          className="text-primary fill-primary-light"
        />
      </motion.div>
    </div>
  );
}

// Skeleton loading placeholder
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={cn(
        'rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={style}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
