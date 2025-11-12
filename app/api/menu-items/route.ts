import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { FREE_ITEM_LIMIT } from '@/menuData';

async function getOwnerByCategory(categoryId: string) {
  const { data: category } = await supabaseServer
    ?.from('menu_categories')
    .select('id, restaurant_id')
    .eq('id', categoryId)
    .maybeSingle();

  if (!category) return null;

  const { data: restaurant } = await supabaseServer
    ?.from('restaurants')
    .select('id, owner_id, plan_tier')
    .eq('id', category.restaurant_id)
    .maybeSingle();

  if (!restaurant) return null;

  return { restaurant, category };
}

async function getOwnerByItem(itemId: string) {
  const { data: item } = await supabaseServer
    ?.from('menu_items')
    .select('id, category_id')
    .eq('id', itemId)
    .maybeSingle();

  if (!item) return null;

  return getOwnerByCategory(item.category_id);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
  }

  const body = await request.json();
  const { categoryId, name, description, price, priceMode, unitLabel, imageUrl, isAvailable, options } = body;

  if (!categoryId || !name || typeof price !== 'number') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const context = await getOwnerByCategory(categoryId);

  if (!context) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const { restaurant } = context;

  if (restaurant.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (restaurant.plan_tier === 'free') {
    const { data: categories } = await supabaseServer
      .from('menu_categories')
      .select('id')
      .eq('restaurant_id', restaurant.id);
    const categoryIds = (categories ?? []).map((cat) => cat.id);
    const { count } = await supabaseServer
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .in('category_id', categoryIds);
    if ((count ?? 0) >= FREE_ITEM_LIMIT) {
      return NextResponse.json({ error: 'Free plan limit reached' }, { status: 403 });
    }
  }

  const { data: item, error: insertError } = await supabaseServer
    .from('menu_items')
    .insert({
      category_id: categoryId,
      name,
      description,
      base_price: price,
      price_mode: priceMode ?? 'fixed',
      unit_label: unitLabel ?? null,
      image_url: imageUrl ?? null,
      is_available: isAvailable ?? true,
    })
    .select('id')
    .single();

  if (insertError || !item) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to create item' }, { status: 500 });
  }

  if (options && Array.isArray(options) && options.length > 0) {
    const inserts = options
      .filter((opt: any) => opt?.label && typeof opt?.price === 'number')
      .map((opt: any, index: number) => ({
        item_id: item.id,
        label: opt.label,
        price: opt.price,
        unit_label: opt.unitLabel ?? null,
        position: opt.position ?? index,
      }));
    if (inserts.length > 0) {
      await supabaseServer.from('menu_item_options').insert(inserts);
    }
  }

  return NextResponse.json({ success: true, itemId: item.id });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
  }

  const body = await request.json();
  const { itemId, name, description, price, priceMode, unitLabel, imageUrl, isAvailable, categoryId, options } = body;
  if (!itemId) {
    return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
  }

  const context = await getOwnerByItem(itemId);
  if (!context) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (context.restaurant.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (categoryId && categoryId !== context.category.id) {
    const targetContext = await getOwnerByCategory(categoryId);
    if (!targetContext || targetContext.restaurant.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Cannot move item to that category' }, { status: 403 });
    }
  }

  const updatePayload: Record<string, unknown> = {};
  if (name !== undefined) updatePayload.name = name;
  if (description !== undefined) updatePayload.description = description;
  if (price !== undefined) updatePayload.base_price = price;
  if (priceMode !== undefined) updatePayload.price_mode = priceMode;
  if (unitLabel !== undefined) updatePayload.unit_label = unitLabel;
  if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
  if (isAvailable !== undefined) updatePayload.is_available = isAvailable;
  if (categoryId !== undefined) updatePayload.category_id = categoryId;

  const { error } = await supabaseServer.from('menu_items').update(updatePayload).eq('id', itemId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(options)) {
    const normalized = options
      .filter((opt) => opt && opt.label && typeof opt.price === 'number')
      .map((opt, index) => ({
        id: opt.id,
        item_id: itemId,
        label: opt.label,
        price: opt.price,
        unit_label: opt.unitLabel ?? null,
        position: opt.position ?? index,
      }));

    const { data: existing } = await supabaseServer
      .from('menu_item_options')
      .select('id')
      .eq('item_id', itemId);

    const existingIds = new Set((existing ?? []).map((row: any) => row.id));
    const incomingIds = new Set(normalized.filter((opt) => opt.id).map((opt) => opt.id as string));

    for (const option of normalized) {
      if (option.id) {
        await supabaseServer
          .from('menu_item_options')
          .update({
            label: option.label,
            price: option.price,
            unit_label: option.unit_label,
            position: option.position,
          })
          .eq('id', option.id);
      } else {
        await supabaseServer.from('menu_item_options').insert({
          item_id: itemId,
          label: option.label,
          price: option.price,
          unit_label: option.unit_label,
          position: option.position,
        });
      }
    }

    for (const existingId of existingIds) {
      if (!incomingIds.has(existingId)) {
        await supabaseServer.from('menu_item_options').delete().eq('id', existingId);
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('id');
  if (!itemId) {
    return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
  }

  const context = await getOwnerByItem(itemId);
  if (!context) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  if (context.restaurant.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseServer.from('menu_items').delete().eq('id', itemId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
