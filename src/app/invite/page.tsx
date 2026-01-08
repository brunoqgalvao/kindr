'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Share2, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasPartner, setHasPartner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrCreateCouple();
  }, []);

  const fetchOrCreateCouple = async () => {
    try {
      // Try to get existing couple
      let response = await fetch('/api/couples');
      let data = await response.json();

      if (!data.couple) {
        // Create new couple
        response = await fetch('/api/couples', { method: 'POST' });
        data = await response.json();
      }

      if (data.couple) {
        setInviteCode(data.couple.invite_code);
        setInviteUrl(`${window.location.origin}/join/${data.couple.invite_code}`);
        setHasPartner(!!data.couple.user_2_id);
      }
    } catch (error) {
      console.error('Error fetching couple:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Kindr!',
          text: "Let's find the perfect baby name together!",
          url: inviteUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const continueToOnboarding = () => {
    router.push('/onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Heart className="h-12 w-12 text-[var(--primary)] animate-heart-beat" />
          <p className="text-[var(--foreground-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasPartner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--like)] flex items-center justify-center">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              You&apos;re Connected!
            </h1>
            <p className="text-[var(--foreground-muted)]">
              Your partner has joined. Let&apos;s set up your preferences and start swiping!
            </p>
          </div>

          <Button onClick={continueToOnboarding} className="w-full" size="lg">
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Heart className="h-10 w-10 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Invite Your Partner
          </h1>
          <p className="text-[var(--foreground-muted)]">
            Share this link so you can find the perfect name together
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
            Your invite link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-[var(--background)] rounded-xl text-sm text-[var(--foreground)] border-none outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-3 rounded-xl bg-[var(--background)] hover:bg-gray-100 transition-colors"
              aria-label="Copy link"
            >
              {copied ? (
                <Check className="h-5 w-5 text-[var(--like)]" />
              ) : (
                <Copy className="h-5 w-5 text-[var(--foreground-muted)]" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-sm text-[var(--like)] mt-2">Copied to clipboard!</p>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={shareInvite} className="w-full" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share Invite
          </Button>

          <Button
            onClick={continueToOnboarding}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Skip for now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
          Your partner can join later using this link. The link expires in 7 days.
        </p>
      </div>
    </div>
  );
}
