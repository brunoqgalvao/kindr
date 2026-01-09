'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MatchPayload {
  id: string;
  couple_id: string;
  name_id: string;
  is_favorited: boolean;
  created_at: string;
}

interface UseRealtimeMatchesOptions {
  coupleId: string | null;
  onNewMatch?: (match: MatchPayload) => void;
  enabled?: boolean;
}

/**
 * Hook to subscribe to realtime match notifications
 * When your partner swipes and creates a match, you'll see it instantly
 */
export function useRealtimeMatches({
  coupleId,
  onNewMatch,
  enabled = true,
}: UseRealtimeMatchesOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  useEffect(() => {
    if (!coupleId || !enabled) {
      cleanup();
      return;
    }

    // Subscribe to INSERT events on the matches table for this couple
    const channel = supabase
      .channel(`matches:couple_id=eq.${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          const newMatch = payload.new as MatchPayload;
          onNewMatch?.(newMatch);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime: Subscribed to match updates');
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [coupleId, enabled, onNewMatch, supabase, cleanup]);

  return { cleanup };
}
