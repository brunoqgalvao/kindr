'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after a short delay for the animation
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE4EC]">
      <div className="animate-bounce">
        <Heart className="h-16 w-16 text-[#FF6B9D] fill-[#FF6B9D]" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-[#333]">
        Kindr
      </h1>
      <p className="mt-2 text-lg text-[#666]">
        Find the perfect name, together
      </p>
      <div className="mt-8 flex gap-1">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B9D]" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B9D]" style={{ animationDelay: '150ms' }} />
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B9D]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
