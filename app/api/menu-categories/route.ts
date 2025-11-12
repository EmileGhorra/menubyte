import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseServer } from '@/lib/supabaseServer';

async function verifyOwnership(categoryId: string, userId: string) {
  if (!supabaseServer) {
    return { ok: false as const };
  }

  const { data: category } = await supabaseServer
    .from('menu_categories')
    .select('id, restaurant_id')
    .eq('id', categoryId)
    .maybeSingle();

  if (!category) return { ok: false };

  const { data: restaurant } = await supabaseServer
    .from('restaurants')
    .select('id, owner_id')
    .eq('id', category.restaurant_id)
    .maybeSingle();

  if (!restaurant || restaurant.owner_id !== userId) {
    return { ok: false };
  }

  return { ok: true, restaurantId: restaurant.id };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !supabaseServer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { restaurantId, title } = body;
  if (!restaurantId || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: restaurant, error } = await supabaseServer
    .from('restaurants')
    .select('id, owner_id')
    .eq('id', restaurantId)
    .maybeSingle();

  if (error || !restaurant || restaurant.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error: insertError } = await supabaseServer
    .from('menu_categories')
    .insert({ restaurant_id: restaurantId, title, position: 0 })
    .select('id, title, position')
    .single();

  if (insertError || !data) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to create category' }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !supabaseServer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, position, positions } = await request.json();

  if (Array.isArray(positions) && positions.length > 0) {
    const ids = positions.map((entry: { id: string }) => entry.id);
    const { data: categories, error: catError } = await supabaseServer
      .from('menu_categories')
      .select('id, restaurant_id')
      .in('id', ids);

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({ error: 'Categories not found' }, { status: 404 });
    }

    const restaurantIds = Array.from(new Set(categories.map((cat) => cat.restaurant_id)));
    const { data: restaurants } = await supabaseServer
      .from('restaurants')
      .select('id, owner_id')
      .in('id', restaurantIds);

    if (!restaurants || restaurants.some((rest) => rest.owner_id !== session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    for (const entry of positions as { id: string; position: number }[]) {
      const { error: updateError } = await supabaseServer
        .from('menu_categories')
        .update({ position: entry.position })
        .eq('id', entry.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
  }

  const ownership = await verifyOwnership(id, session.user.id);
  if (!ownership.ok) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseServer
    .from('menu_categories')
    .update({ title, position })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !supabaseServer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
  }

  const ownership = await verifyOwnership(id, session.user.id);
  if (!ownership.ok) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseServer.from('menu_categories').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
