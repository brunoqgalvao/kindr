'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Heart, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JoinPage() {
  const [status, setStatus] = useState<'loading' | 'joining' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      joinCouple();
    }
  }, [code]);

  const joinCouple = async () => {
    setStatus('joining');
    try {
      const response = await fetch('/api/couples/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join');
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  const goToSignup = () => {
    router.push(`/signup?invite=${code}`);
  };

  if (status === 'loading' || status === 'joining') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Joining your partner...
          </h1>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--like)] flex items-center justify-center">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            You&apos;re Connected!
          </h1>
          <p className="text-[var(--foreground-muted)]">
            Redirecting you to set up preferences...
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Heart className="h-6 w-6 text-[var(--primary)] fill-[var(--primary)] animate-pulse" />
            <Heart className="h-6 w-6 text-[var(--primary)] fill-[var(--primary)] animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    const isAuthError = error?.includes('Unauthorized');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--dislike)] flex items-center justify-center">
            <X className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {isAuthError ? 'Sign In Required' : 'Oops!'}
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            {isAuthError
              ? 'You need to create an account or sign in to join your partner.'
              : error
            }
          </p>

          {isAuthError ? (
            <div className="space-y-3">
              <Button onClick={goToSignup} className="w-full" size="lg">
                Create Account
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                I already have an account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={() => joinCouple()} className="w-full" size="lg">
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Go Home
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
