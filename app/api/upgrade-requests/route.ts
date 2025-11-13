import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import {
  applyProUpgrade,
  creditWallet,
  getLatestUpgradeRequest,
  isAdminUser,
  PRO_PLAN_PRICE,
} from '@/lib/wallet';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!supabaseServer) {
    return NextResponse.json({ requests: [] });
  }

  const { data, error } = await supabaseServer
    .from('upgrade_requests')
    .select('id, user_id, display_name, amount, status, status_message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const requests = data ?? [];
  if (requests.length === 0) {
    return NextResponse.json({ requests });
  }

  const userIds = Array.from(new Set(requests.map((req) => req.user_id)));

  const { data: userRows } = await supabaseServer
    .from('users')
    .select('id, email, name, plan_tier, pro_expires_at')
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

  const enriched = requests.map((request) => {
    const user = userMap.get(request.user_id);
    const restaurant = restaurantMap.get(request.user_id);
    const requestMode = user?.plan_tier === 'pro' ? 'extend' : 'upgrade';
    return {
      ...request,
      user_email: user?.email ?? null,
      restaurant_name: restaurant?.name ?? null,
      request_mode: requestMode,
    };
  });

  return NextResponse.json({ requests: enriched });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !supabaseServer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { displayName } = await request.json().catch(() => ({ displayName: null as string | null }));
  const effectiveName = displayName?.trim() || session.user?.name || session.user?.email || 'MenuByte Owner';

  const existingRequest = await getLatestUpgradeRequest(session.user.id);
  if (existingRequest && existingRequest.status === 'pending') {
    return NextResponse.json(
      { error: 'You already have a pending upgrade request. Please wait for approval.' },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from('upgrade_requests').insert({
    user_id: session.user.id,
    display_name: effectiveName,
    amount: PRO_PLAN_PRICE,
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email) || !supabaseServer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, action, message } = (await request.json().catch(() => ({}))) as {
    id?: string;
    action?: 'approve' | 'reject';
    message?: string;
  };

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: requestRow, error: fetchError } = await supabaseServer
    .from('upgrade_requests')
    .select('id, user_id, amount, status')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !requestRow) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  if (requestRow.status !== 'pending') {
    return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
  }

  if (action === 'reject') {
    await supabaseServer
      .from('upgrade_requests')
      .update({ status: 'rejected', status_message: message ?? 'Payment not confirmed', resolved_at: new Date().toISOString() })
      .eq('id', id);
    return NextResponse.json({ success: true });
  }

  const amount = Number(requestRow.amount ?? PRO_PLAN_PRICE);
  const creditResult = await creditWallet(requestRow.user_id, amount, `upgrade:${id}`, { requestId: id });
  if (!creditResult.ok) {
    return NextResponse.json({ error: creditResult.error }, { status: 500 });
  }

  const upgradeResult = await applyProUpgrade(requestRow.user_id, { reference: `upgrade:${id}`, startFromExpiry: true });

  await supabaseServer
    .from('upgrade_requests')
    .update({
      status: 'approved',
      resolved_at: new Date().toISOString(),
      status_message: upgradeResult.ok
        ? message ?? 'Payment confirmed and Pro activated.'
        : `Wallet credited but upgrade pending: ${upgradeResult.error}`,
    })
    .eq('id', id);

  return NextResponse.json({ success: true, upgradeApplied: upgradeResult.ok });
}
