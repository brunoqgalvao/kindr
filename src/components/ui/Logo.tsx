'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const sizeStyles = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 28,
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ className, size = 'md', showIcon = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2',
          'font-display font-bold',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <span className="text-gradient">Kindr</span>
        {showIcon && (
          <Heart
            size={iconSizes[size]}
            className="text-primary fill-primary animate-pulse-soft"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Logo.displayName = 'Logo';
