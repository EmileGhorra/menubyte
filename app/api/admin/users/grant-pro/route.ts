import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdminUser, applyProUpgrade, creditWallet, PRO_PLAN_PRICE } from '@/lib/wallet';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User id is required' }, { status: 400 });
  }

  // Credit the wallet first so applyProUpgrade succeeds even if balance was zero.
  const creditResult = await creditWallet(userId, PRO_PLAN_PRICE, 'admin-grant', { grantedBy: session.user.email });
  if (!creditResult.ok) {
    return NextResponse.json({ error: creditResult.error }, { status: 400 });
  }

  const upgrade = await applyProUpgrade(userId, { reference: 'admin-grant', startFromExpiry: true });
  if (!upgrade.ok) {
    return NextResponse.json({ error: upgrade.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, balance: upgrade.balance });
}
