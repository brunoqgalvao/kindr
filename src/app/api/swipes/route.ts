import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nameId, decision } = await request.json();

    if (!nameId || !decision || !['like', 'dislike'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Record the swipe
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert({
        user_id: user.id,
        name_id: nameId,
        decision,
      });

    if (swipeError) {
      // Check if it's a duplicate swipe
      if (swipeError.code === '23505') {
        return NextResponse.json(
          { error: 'Already swiped on this name' },
          { status: 409 }
        );
      }
      console.error('Swipe error:', swipeError);
      return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 });
    }

    // If it was a like, check for a match
    if (decision === 'like') {
      // Get the user's couple
      const { data: couple } = await supabase
        .from('couples')
        .select('*')
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .single();

      if (couple && couple.user_2_id) {
        // Both users are in the couple, check if partner liked this name
        const partnerId = couple.user_1_id === user.id ? couple.user_2_id : couple.user_1_id;

        const { data: partnerSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', partnerId)
          .eq('name_id', nameId)
          .eq('decision', 'like')
          .single();

        if (partnerSwipe) {
          // It's a match! Check if match already exists
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('*')
            .eq('couple_id', couple.id)
            .eq('name_id', nameId)
            .single();

          if (!existingMatch) {
            // Create the match
            const { data: newMatch, error: matchError } = await supabase
              .from('matches')
              .insert({
                couple_id: couple.id,
                name_id: nameId,
              })
              .select(`
                *,
                names (*)
              `)
              .single();

            if (matchError) {
              console.error('Match creation error:', matchError);
            } else {
              return NextResponse.json({
                success: true,
                match: newMatch,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Swipe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
