import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country'); // BR, US, or BOTH
    const gender = searchParams.get('gender'); // M, F, or BOTH
    const excludedLetters = searchParams.get('excluded')?.split(',').filter(Boolean) || [];
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

    // Get names the user has already swiped on
    const { data: swipedNames } = await supabase
      .from('swipes')
      .select('name_id')
      .eq('user_id', user.id);

    const swipedIds = swipedNames?.map(s => s.name_id) || [];

    // Build the query
    let query = supabase.from('names').select('*');

    // Filter by country
    if (country && country !== 'BOTH') {
      query = query.eq('country', country);
    }

    // Filter by gender
    if (gender && gender !== 'BOTH') {
      query = query.or(`gender.eq.${gender},gender.eq.U`);
    }

    // Exclude already swiped names
    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    // Get more names than needed to account for letter filtering
    const { data: names, error } = await query
      .order('popularity_rank', { ascending: true, nullsFirst: false })
      .limit(limit * 3); // Fetch extra to account for letter filtering

    if (error) {
      console.error('Error fetching names:', error);
      return NextResponse.json({ error: 'Failed to fetch names' }, { status: 500 });
    }

    // Filter by excluded letters
    let filteredNames = names || [];
    if (excludedLetters.length > 0) {
      const excludedLower = excludedLetters.map(l => l.toLowerCase());
      filteredNames = filteredNames.filter(name => {
        const nameLower = name.name.toLowerCase();
        return !excludedLower.some(letter => nameLower.includes(letter));
      });
    }

    // Shuffle the names for randomness and limit to requested amount
    const shuffled = filteredNames
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return NextResponse.json({
      names: shuffled,
      hasMore: filteredNames.length > limit,
    });
  } catch (error) {
    console.error('Names API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
