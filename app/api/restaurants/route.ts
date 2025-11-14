import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { slugify } from '@/lib/utils/slugify';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const name = body.name?.trim();
  const slugInput = body.slug?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const slug = slugify(slugInput || name);
  const heroImage = body.heroImage?.trim();

  const { data: existing } = await supabaseServer
    .from('restaurants')
    .select('id')
    .eq('owner_id', session.user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'You already have a restaurant' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('restaurants')
    .insert({
      owner_id: session.user.id,
      name,
      slug,
      qr_slug: slug,
      description: body.description ?? '',
      hero_image: heroImage ?? '',
      address: body.address ?? '',
      phone: body.phone ?? '',
      plan_tier: 'free',
    })
    .select('id, slug')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to create restaurant' }, { status: 500 });
  }

  await supabaseServer.from('menu_categories').insert({
    restaurant_id: data.id,
    title: 'Featured',
    position: 1,
  });

  return NextResponse.json({ success: true, slug: data.slug });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !supabaseServer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const restaurantId = body.id;
  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant id is required' }, { status: 400 });
  }

  const { data: restaurant, error } = await supabaseServer
    .from('restaurants')
    .select('id, owner_id')
    .eq('id', restaurantId)
    .maybeSingle();

  if (error || !restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  if (restaurant.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updatePayload = {
    name: body.name?.trim() ?? undefined,
    description: body.description ?? undefined,
    hero_image: body.heroImage ?? undefined,
    address: body.address ?? undefined,
    phone: body.phone ?? undefined,
    slug: body.slug ? slugify(body.slug) : undefined,
  };

  if (updatePayload.slug) {
    const { data: slugOwner } = await supabaseServer
      .from('restaurants')
      .select('id')
      .eq('slug', updatePayload.slug)
      .neq('id', restaurantId)
      .maybeSingle();
    if (slugOwner) {
      return NextResponse.json({ error: 'Slug already in use. Please pick another one.' }, { status: 409 });
    }
  }

  const { error: updateError } = await supabaseServer
    .from('restaurants')
    .update(updatePayload)
    .eq('id', restaurantId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
