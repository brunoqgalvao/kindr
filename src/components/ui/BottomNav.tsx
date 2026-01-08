'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/swipe', icon: Home, label: 'Swipe' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-100 safe-bottom z-50"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'min-w-[64px] h-full',
                'transition-all duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                'active:scale-95',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-all',
                  isActive && item.href === '/matches' && 'fill-current animate-pulse-soft'
                )}
                aria-hidden="true"
              />
              <span className={cn(
                'text-xs font-display font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
