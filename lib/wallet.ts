import { supabaseServer } from '@/lib/supabaseServer';
import { subscriptionPlans } from '@/menuData';

export const PRO_PLAN_PRICE = subscriptionPlans.find((plan) => plan.id === 'pro')?.pricePerMonth ?? 10;
export const PRO_PLAN_DURATION_DAYS = Number(process.env.PRO_PLAN_DURATION_DAYS ?? 30);

export type WalletSummary = {
  balance: number;
};

export type UpgradeRequest = {
  id: string;
  user_id: string;
  display_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  status_message?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminUser(email?: string | null) {
  if (!email) return false;
  if (ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getWalletSummary(userId: string): Promise<WalletSummary> {
  if (!supabaseServer) {
    return { balance: 0 };
  }

  const { data } = await supabaseServer.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
  return { balance: data?.balance ?? 0 };
}

export async function getLatestUpgradeRequest(userId: string) {
  if (!supabaseServer) return null;

  const { data } = await supabaseServer
    .from('upgrade_requests')
    .select('id, user_id, display_name, amount, status, status_message, created_at, resolved_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as UpgradeRequest | null) ?? null;
}

export async function listPendingRequests(limit = 50) {
  if (!supabaseServer) return [];

  const { data } = await supabaseServer
    .from('upgrade_requests')
    .select('id, user_id, display_name, amount, status, status_message, created_at, resolved_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  const requests = (data as UpgradeRequest[] | null) ?? [];
  if (requests.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(requests.map((request) => request.user_id)));

  const { data: userRows } = await supabaseServer
    .from('users')
    .select('id, email, plan_tier, pro_expires_at')
    .in('id', userIds);

  const { data: restaurantRows } = await supabaseServer
    .from('restaurants')
    .select('id, owner_id, name')
    .in('owner_id', userIds)
    .order('created_at', { ascending: true });

  const userMap = new Map(
    (userRows ?? []).map((user) => [user.id, user])
  );
  const restaurantMap = new Map<string, { id: string; name: string }>();
  (restaurantRows ?? []).forEach((restaurant) => {
    if (!restaurantMap.has(restaurant.owner_id)) {
      restaurantMap.set(restaurant.owner_id, restaurant);
    }
  });

  return requests.map((request) => {
    const user = userMap.get(request.user_id);
    const restaurant = restaurantMap.get(request.user_id);
    const mode: 'upgrade' | 'extend' = user?.plan_tier === 'pro' ? 'extend' : 'upgrade';
    return {
      ...request,
      user_email: user?.email ?? null,
      restaurant_name: restaurant?.name ?? null,
      request_mode: mode,
    };
  });
}

export type UserPlanMeta = {
  plan_tier: string;
  plan_status: string;
  pro_expires_at: string | null;
};

export async function getUserPlanMeta(userId: string): Promise<UserPlanMeta | null> {
  if (!supabaseServer) return null;

  const { data } = await supabaseServer
    .from('users')
    .select('plan_tier, plan_status, pro_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;
  return data as UserPlanMeta;
}

export async function ensurePlanStatus(userId: string) {
  if (!supabaseServer) return;
  const meta = await getUserPlanMeta(userId);
  if (!meta) return;

  const now = new Date();
  if (meta.plan_tier === 'pro') {
    if (!meta.pro_expires_at) {
      await applyProUpgrade(userId, { reference: 'missing-expiry', startFromExpiry: false });
      return;
    }

    const expiryDate = new Date(meta.pro_expires_at);
    if (expiryDate.getTime() <= now.getTime()) {
      const { balance } = await getWalletSummary(userId);
      if (balance >= PRO_PLAN_PRICE) {
        await applyProUpgrade(userId, { reference: 'auto-renew', startFromExpiry: true });
      } else {
        await downgradeUserToFree(userId);
      }
    }
  }
}

export async function creditWallet(
  userId: string,
  amount: number,
  reference?: string,
  metadata?: Record<string, unknown>
) {
  if (!supabaseServer) {
    return { ok: false as const, error: 'Supabase unavailable' };
  }
  if (!amount || amount <= 0) {
    return { ok: false as const, error: 'Invalid amount' };
  }

  const { balance } = await getWalletSummary(userId);
  const newBalance = balance + amount;

  await supabaseServer
    .from('wallets')
    .upsert(
      { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  await supabaseServer.from('wallet_transactions').insert({
    user_id: userId,
    amount,
    transaction_type: 'credit_whish',
    reference: reference ?? null,
    metadata: metadata ?? null,
  });

  return { ok: true as const, balance: newBalance };
}

export async function applyProUpgrade(
  userId: string,
  options?: { reference?: string; durationDays?: number; startFromExpiry?: boolean }
) {
  if (!supabaseServer) {
    return { ok: false as const, error: 'Supabase unavailable' };
  }

  const { balance } = await getWalletSummary(userId);
  if (balance < PRO_PLAN_PRICE) {
    return { ok: false as const, error: 'Insufficient wallet balance' };
  }

  const newBalance = balance - PRO_PLAN_PRICE;
  const durationDays = options?.durationDays ?? PRO_PLAN_DURATION_DAYS;
  const meta = await getUserPlanMeta(userId);
  const now = new Date();
  const baseDate =
    options?.startFromExpiry && meta?.pro_expires_at
      ? new Date(meta.pro_expires_at) > now
        ? new Date(meta.pro_expires_at)
        : now
      : now;
  const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await supabaseServer
    .from('wallets')
    .upsert(
      { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  await supabaseServer.from('wallet_transactions').insert({
    user_id: userId,
    amount: -PRO_PLAN_PRICE,
    transaction_type: 'debit_upgrade',
    reference: options?.reference ?? null,
  });

  await setUserPlanToPro(userId, newExpiry.toISOString());

  return { ok: true as const, balance: newBalance };
}

export async function setUserPlanToPro(userId: string, proExpiresAtIso: string) {
  if (!supabaseServer) return;

  await supabaseServer
    .from('users')
    .update({ plan_tier: 'pro', plan_status: 'active', pro_expires_at: proExpiresAtIso })
    .eq('id', userId);
  await supabaseServer.from('restaurants').update({ plan_tier: 'pro' }).eq('owner_id', userId);

  const { data: restaurants } = await supabaseServer.from('restaurants').select('id').eq('owner_id', userId);

  if (restaurants && restaurants.length > 0) {
    for (const restaurant of restaurants) {
      const { data: existing } = await supabaseServer
        .from('subscriptions')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .maybeSingle();

      if (existing?.id) {
        await supabaseServer
          .from('subscriptions')
          .update({ plan_tier: 'pro', status: 'active', user_id: userId })
          .eq('id', existing.id);
      } else {
        await supabaseServer
          .from('subscriptions')
          .insert({ user_id: userId, restaurant_id: restaurant.id, plan_tier: 'pro', status: 'active' });
      }
    }
  }
}

export async function downgradeUserToFree(userId: string) {
  if (!supabaseServer) return;
  await supabaseServer
    .from('users')
    .update({ plan_tier: 'free', plan_status: 'inactive', pro_expires_at: null })
    .eq('id', userId);
  await supabaseServer.from('restaurants').update({ plan_tier: 'free' }).eq('owner_id', userId);
  await supabaseServer.from('subscriptions').update({ plan_tier: 'free', status: 'inactive' }).eq('user_id', userId);
}
