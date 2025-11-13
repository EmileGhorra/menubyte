import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { applyProUpgrade } from '@/lib/wallet';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await applyProUpgrade(session.user.id, { reference: 'self-upgrade', startFromExpiry: true });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, balance: result.balance });
}
