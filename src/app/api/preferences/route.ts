import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Get preferences for user's couple
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
      return NextResponse.json({ preferences: null });
    }

    // Get preferences
    const { data: preferences } = await supabase
      .from('preferences')
      .select('*')
      .eq('couple_id', couple.id)
      .single();

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update preferences
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { country, gender, excludedLetters } = await request.json();

    // Get or create couple
    let { data: couple } = await supabase
      .from('couples')
      .select('id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .single();

    // If no couple exists, create one
    if (!couple) {
      const { generateInviteCode } = await import('@/lib/utils');
      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newCouple, error: coupleError } = await supabase
        .from('couples')
        .insert({
          user_1_id: user.id,
          invite_code: inviteCode,
          invite_expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (coupleError) {
        console.error('Create couple error:', coupleError);
        return NextResponse.json({ error: 'Failed to create couple' }, { status: 500 });
      }

      couple = newCouple;
    }

    // Check if preferences exist
    const { data: existingPrefs } = await supabase
      .from('preferences')
      .select('id')
      .eq('couple_id', couple!.id)
      .single();

    const prefsData = {
      couple_id: couple!.id,
      country: country || 'BOTH',
      gender: gender || 'BOTH',
      excluded_letters: excludedLetters || [],
    };

    let result;
    if (existingPrefs) {
      // Update existing preferences
      result = await supabase
        .from('preferences')
        .update(prefsData)
        .eq('id', existingPrefs.id)
        .select()
        .single();
    } else {
      // Create new preferences
      result = await supabase
        .from('preferences')
        .insert(prefsData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Save preferences error:', result.error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({ preferences: result.data });
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
