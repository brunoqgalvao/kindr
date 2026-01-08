import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateInviteCode } from '@/lib/utils';

// GET - Get user's couple info
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: couple } = await supabase
      .from('couples')
      .select(`
        *,
        user1:profiles!couples_user_1_id_fkey(id, display_name),
        user2:profiles!couples_user_2_id_fkey(id, display_name)
      `)
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .single();

    return NextResponse.json({ couple });
  } catch (error) {
    console.error('Get couple error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new couple (user becomes user_1)
export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already in a couple
    const { data: existingCouple } = await supabase
      .from('couples')
      .select('*')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .single();

    if (existingCouple) {
      return NextResponse.json({ couple: existingCouple });
    }

    // Create new couple with invite code
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: newCouple, error } = await supabase
      .from('couples')
      .insert({
        user_1_id: user.id,
        invite_code: inviteCode,
        invite_expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create couple error:', error);
      return NextResponse.json({ error: 'Failed to create couple' }, { status: 500 });
    }

    return NextResponse.json({ couple: newCouple });
  } catch (error) {
    console.error('Couple API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
