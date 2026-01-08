'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Share2, Copy, Check, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/BottomNav';

interface Preferences {
  country: 'BR' | 'US' | 'BOTH';
  gender: 'M' | 'F' | 'BOTH';
  excluded_letters: string[];
}

interface Couple {
  id: string;
  invite_code: string;
  user_1_id: string;
  user_2_id: string | null;
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prefsRes, coupleRes] = await Promise.all([
        fetch('/api/preferences'),
        fetch('/api/couples'),
      ]);

      const prefsData = await prefsRes.json();
      const coupleData = await coupleRes.json();

      setPreferences(prefsData.preferences);
      setCouple(coupleData.couple);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!couple?.invite_code) return;
    const url = `${window.location.origin}/join/${couple.invite_code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <RefreshCw className="h-8 w-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const inviteUrl = couple?.invite_code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${couple.invite_code}`
    : '';

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      </header>

      <main className="px-4 space-y-6">
        {/* Partner Status */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--foreground-muted)] mb-3">
            PARTNER
          </h2>
          {couple?.user_2_id ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--like)] flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  Connected!
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  You&apos;re swiping together
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[var(--foreground-muted)]">
                Invite your partner to start matching names together!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[var(--background)] rounded-lg text-sm text-[var(--foreground)]"
                />
                <button
                  onClick={copyInviteLink}
                  className="p-2 rounded-lg bg-[var(--background)] hover:bg-gray-200"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-[var(--like)]" />
                  ) : (
                    <Copy className="h-5 w-5 text-[var(--foreground-muted)]" />
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--foreground-muted)] mb-3">
            PREFERENCES
          </h2>

          <button
            onClick={() => router.push('/onboarding')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <div>
              <p className="font-medium text-[var(--foreground)]">Country</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {preferences?.country === 'BR'
                  ? '🇧🇷 Brazil'
                  : preferences?.country === 'US'
                  ? '🇺🇸 USA'
                  : '🌎 Both'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
          </button>

          <button
            onClick={() => router.push('/onboarding')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100"
          >
            <div>
              <p className="font-medium text-[var(--foreground)]">Gender</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {preferences?.gender === 'M'
                  ? '👦 Boy'
                  : preferences?.gender === 'F'
                  ? '👧 Girl'
                  : '🎭 Both'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
          </button>

          <button
            onClick={() => router.push('/onboarding')}
            className="w-full flex items-center justify-between py-3"
          >
            <div>
              <p className="font-medium text-[var(--foreground)]">
                Excluded Letters
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {preferences?.excluded_letters?.length
                  ? preferences.excluded_letters.join(', ')
                  : 'None'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
          </button>
        </section>

        {/* Sign Out */}
        <section>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full text-[var(--dislike)] hover:bg-red-50"
            isLoading={signingOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </section>

        {/* App info */}
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          Kindr v0.1.0 · Made with 💕
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
