import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST - Join a couple via invite code
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Check if user is already in a couple
    const { data: existingCouple } = await supabase
      .from('couples')
      .select('*')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .single();

    if (existingCouple) {
      return NextResponse.json(
        { error: 'You are already in a couple' },
        { status: 400 }
      );
    }

    // Find the couple with this invite code
    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', inviteCode)
      .is('user_2_id', null)
      .single();

    if (findError || !couple) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 404 }
      );
    }

    // Check if invite has expired
    if (couple.invite_expires_at && new Date(couple.invite_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }

    // Check if user is trying to join their own couple
    if (couple.user_1_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot join your own couple' },
        { status: 400 }
      );
    }

    // Join the couple
    const { data: updatedCouple, error: updateError } = await supabase
      .from('couples')
      .update({ user_2_id: user.id })
      .eq('id', couple.id)
      .select()
      .single();

    if (updateError) {
      console.error('Join couple error:', updateError);
      return NextResponse.json({ error: 'Failed to join couple' }, { status: 500 });
    }

    return NextResponse.json({ couple: updatedCouple });
  } catch (error) {
    console.error('Join couple API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
