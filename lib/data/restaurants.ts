// NOTE: Fallback to static menuData whenever Supabase is unavailable so onboarding remains usable offline.
import type { MenuCategory, MenuItem, MenuItemOption, PlanTier, RestaurantMenu } from '@/types/menu';
import { menuData, getRestaurantBySlug as getStaticRestaurant } from '@/menuData';
import { supabaseServer } from '@/lib/supabaseServer';
import { ensurePlanStatus } from '@/lib/wallet';

const transformItemOptions = (options: any[] | null | undefined): MenuItemOption[] | undefined => {
  if (!options || options.length === 0) return undefined;
  return options.map((option, index) => ({
    id: option.id,
    label: option.label,
    price: Number(option.price ?? 0),
    unitLabel: option.unit_label ?? undefined,
    position: option.position ?? index,
  }));
};

const transformItems = (items: any[] | null | undefined, categoryTitle: string): MenuItem[] => {
  if (!items) return [];
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: Number(item.base_price ?? 0),
    category: categoryTitle,
    imageUrl: item.image_url ?? '',
    isAvailable: item.is_available ?? true,
    priceMode: (item.price_mode as MenuItem['priceMode']) ?? 'fixed',
    unitLabel: item.unit_label ?? undefined,
    options: transformItemOptions(item.menu_item_options),
    position: item.position ?? undefined,
  }));
};

const transformCategories = (categories: any[] | null | undefined): MenuCategory[] => {
  if (!categories) return [];
  return [...categories]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((category, index) => ({
      id: category.id,
      title: category.title,
      position: category.position ?? index,
      items: transformItems(category.menu_items, category.title),
    }));
};

const transformRestaurant = (row: any): RestaurantMenu => {
  const categories = transformCategories(row.menu_categories);
  const featuredItems = categories
    .flatMap((category) =>
      category.items.map((item, index) => ({
        ...item,
        categoryTitle: category.title,
        featuredPosition: item.position ?? index,
      }))
    )
    .sort((a, b) => Number(a.featuredPosition ?? 0) - Number(b.featuredPosition ?? 0))
    .slice(0, 6)
    .map(({ featuredPosition, ...item }) => item);

  return {
    restaurant: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      heroImage: row.hero_image ?? '',
      description: row.description ?? '',
      address: row.address ?? '',
      phone: row.phone ?? '',
      plan: (row.plan_tier as PlanTier) ?? 'free',
      qrCodeUrl: row.qr_slug
        ? `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://menubyte.vercel.app'}/menu/${row.qr_slug}`
        : undefined,
    },
    categories,
    featuredItems,
  };
};

export async function getRestaurantMenuBySlug(slug: string) {
  if (!supabaseServer) {
    return getStaticRestaurant(slug) ?? null;
  }

  let { data, error } = await supabaseServer
    .from('restaurants')
    .select(
      `id, owner_id, name, slug, description, hero_image, address, phone, plan_tier, qr_slug,
        menu_categories ( id, title, position, menu_items ( id, name, description, base_price, price_mode, unit_label, image_url, is_available, menu_item_options ( id, label, price, unit_label, position ) ) )`
    )
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn('[supabase] getRestaurantMenuBySlug fallback', error.message);
    }
    return getStaticRestaurant(slug) ?? null;
  }

  if (data?.owner_id) {
    await ensurePlanStatus(data.owner_id);

    const refetch = await supabaseServer
      .from('restaurants')
      .select(
        `id, owner_id, name, slug, description, hero_image, address, phone, plan_tier, qr_slug,
          menu_categories ( id, title, position, menu_items ( id, name, description, base_price, price_mode, unit_label, image_url, is_available, menu_item_options ( id, label, price, unit_label, position ) ) )`
      )
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (refetch.data) {
      data = refetch.data;
    }
  }

  return data ? transformRestaurant(data) : null;
}

export async function getPrimaryRestaurantForUser(userId?: string) {
  if (!userId || !supabaseServer) {
    return menuData[0];
  }
  await ensurePlanStatus(userId);

  const { data, error } = await supabaseServer
    .from('restaurants')
    .select(
      `id, name, slug, description, hero_image, address, phone, plan_tier, qr_slug,
        menu_categories ( id, title, position, menu_items ( id, name, description, base_price, price_mode, unit_label, image_url, is_available, menu_item_options ( id, label, price, unit_label, position ) ) )`
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[supabase] getPrimaryRestaurantForUser fallback', error.message);
    return menuData[0];
  }

  if (!data) {
    return null;
  }

  return transformRestaurant(data);
}

export async function getAllRestaurants() {
  if (!supabaseServer) {
    return menuData.map((entry) => entry.restaurant);
  }

  const { data, error } = await supabaseServer
    .from('restaurants')
    .select('id, name, slug, description, hero_image, address, phone, plan_tier, qr_slug')
    .order('created_at', { ascending: true });

  if (error || !data) {
    if (error) {
      console.warn('[supabase] getAllRestaurants fallback', error.message);
    }
    return menuData.map((entry) => entry.restaurant);
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    heroImage: row.hero_image ?? '',
    description: row.description ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    plan: (row.plan_tier as PlanTier) ?? 'free',
    qrCodeUrl: row.qr_slug
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://menubyte.vercel.app'}/menu/${row.qr_slug}`
      : undefined,
  }));
}
