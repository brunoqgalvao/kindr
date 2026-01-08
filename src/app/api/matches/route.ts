import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Get all matches for the user's couple
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's couple
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .single();

    if (!couple) {
      return NextResponse.json({ matches: [] });
    }

    // Get matches with name details
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        names (*)
      `)
      .eq('couple_id', couple.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get matches error:', error);
      return NextResponse.json({ error: 'Failed to get matches' }, { status: 500 });
    }

    return NextResponse.json({ matches: matches || [] });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle favorite status
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, isFavorited } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Verify user is part of this match's couple
    const { data: match } = await supabase
      .from('matches')
      .select(`
        *,
        couples!inner (*)
      `)
      .eq('id', matchId)
      .or(`couples.user_1_id.eq.${user.id},couples.user_2_id.eq.${user.id}`)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Update favorite status
    const { data: updated, error } = await supabase
      .from('matches')
      .update({ is_favorited: isFavorited })
      .eq('id', matchId)
      .select(`
        *,
        names (*)
      `)
      .single();

    if (error) {
      console.error('Update match error:', error);
      return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
    }

    return NextResponse.json({ match: updated });
  } catch (error) {
    console.error('Match update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a match
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Verify user is part of this match's couple
    const { data: match } = await supabase
      .from('matches')
      .select(`
        *,
        couples!inner (*)
      `)
      .eq('id', matchId)
      .or(`couples.user_1_id.eq.${user.id},couples.user_2_id.eq.${user.id}`)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Delete the match
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error('Delete match error:', error);
      return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Match delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
