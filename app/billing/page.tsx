import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { subscriptionPlans } from '@/menuData';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';
import type { PlanTier } from '@/types/menu';
import {
  ensurePlanStatus,
  getLatestUpgradeRequest,
  getUserPlanMeta,
  getWalletSummary,
  PRO_PLAN_PRICE,
} from '@/lib/wallet';
import { UpgradeRequestModal } from '@/components/UpgradeRequestModal';
import { SelfUpgradeButton } from '@/components/SelfUpgradeButton';

export default async function BillingPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/billing');
  }
  if (session.user?.id) {
    await ensurePlanStatus(session.user.id);
  }
  const restaurant = await getPrimaryRestaurantForUser(session.user?.id);
  if (!restaurant) {
    redirect('/onboarding');
  }

  const currentPlan = restaurant.restaurant.plan as PlanTier;
  const wallet = session.user?.id ? await getWalletSummary(session.user.id) : { balance: 0 };
  const latestRequest = session.user?.id ? await getLatestUpgradeRequest(session.user.id) : null;
  const planMeta = session.user?.id ? await getUserPlanMeta(session.user.id) : null;
  const proExpiry =
    currentPlan === 'pro' && planMeta?.pro_expires_at ? new Date(planMeta.pro_expires_at) : null;
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const expiryLabel = proExpiry ? dateFormatter.format(proExpiry) : null;
  const formatDate = (value: string) => dateFormatter.format(new Date(value));

  const paymentUrl = process.env.NEXT_PUBLIC_WHISH_PAYMENT_URL ?? 'https://whish.money/pay/4FSafql0W';
  const qrImage = process.env.NEXT_PUBLIC_WHISH_QR_URL ?? undefined;

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar />
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-400">Wallet & plan</p>
            <h1 className="text-3xl font-semibold text-dark">Manage your MenuByte balance</h1>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Current plan</p>
                <p className="text-2xl font-semibold text-dark capitalize">{currentPlan}</p>
                <p className="text-xs text-slate-500">
                  {currentPlan === 'pro'
                    ? proExpiry
                      ? `Active until ${expiryLabel}`
                      : 'Pro benefits active'
                    : 'Free plan with ads'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Wallet balance</p>
                <p className="text-2xl font-semibold text-dark">${wallet.balance.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Funds are added when Whish payments are approved</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Upgrade cost</p>
                <p className="text-2xl font-semibold text-dark">${PRO_PLAN_PRICE}</p>
                <p className="text-xs text-slate-500">Pay via Whish then submit your request</p>
              </div>
            </div>
          </div>

          {latestRequest?.status === 'pending' && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
              <p className="font-semibold">Upgrade pending review</p>
              <p className="mt-1">
                We received your payment proof for <strong>{latestRequest.display_name}</strong> on {formatDate(latestRequest.created_at)}. You’ll
                be notified once it’s approved.
              </p>
            </div>
          )}

          {latestRequest?.status === 'rejected' && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">Payment not confirmed</p>
              <p className="mt-1">
                {latestRequest.status_message ?? 'We could not verify the Whish transfer. Please try again.'}
              </p>
            </div>
          )}

          {latestRequest?.status === 'approved' && currentPlan === 'pro' && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
              <p className="font-semibold">Thanks for upgrading!</p>
              <p className="mt-1">Your restaurant now enjoys all Pro perks. Wallet adjustments were processed.</p>
            </div>
          )}

          {wallet.balance >= PRO_PLAN_PRICE && (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-emerald-500">Ready to upgrade</p>
              <h2 className="text-2xl font-semibold text-dark">
                {currentPlan === 'pro' ? 'Extend your Pro access' : 'Wallet balance covers Pro'}
              </h2>
              <p className="text-sm text-slate-500">
                You have enough funds{' '}
                {currentPlan === 'pro'
                  ? 'to extend your Pro plan for another cycle.'
                  : 'to activate Pro instantly.'}{' '}
                Click below to confirm and we’ll deduct ${PRO_PLAN_PRICE}.
              </p>
              <div className="mt-4">
                <SelfUpgradeButton isPro={currentPlan === 'pro'} />
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Upgrade via Whish</p>
                <h2 className="text-2xl font-semibold text-dark">Manual verification flow</h2>
                <p className="text-sm text-slate-500">
                  Scan the Whish QR, send the upgrade amount, then submit your request so our team can approve it.
                </p>
              </div>
              <UpgradeRequestModal
                amount={PRO_PLAN_PRICE}
                defaultName={session.user?.name ?? session.user?.email ?? 'MenuByte Owner'}
                qrImageUrl={qrImage}
                paymentUrl={paymentUrl}
                pendingStatus={latestRequest?.status}
              />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-dark">1. Pay with Whish</p>
                <p className="text-sm text-slate-500">Use the QR in the modal and include your restaurant name.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-dark">2. Submit upgrade request</p>
                <p className="text-sm text-slate-500">Tell us who paid so we can find the transfer quickly.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-dark">3. Admin approval</p>
                <p className="text-sm text-slate-500">We credit your wallet, deduct the upgrade, and switch you to Pro.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  plan.isPopular ? 'border-primary ring-1 ring-primary/30' : 'border-slate-200'
                }`}
              >
                <p className="text-sm uppercase tracking-wide text-slate-400">{plan.name}</p>
                <h2 className="text-3xl font-semibold text-dark">
                  ${plan.pricePerMonth}
                  <span className="text-base font-normal text-slate-500"> /mo</span>
                </h2>
                {plan.id === 'free' ? (
                  <p className="text-sm font-medium text-amber-600">Includes MenuByte ads</p>
                ) : (
                  <p className="text-sm font-medium text-emerald-600">No ads + unlimited items</p>
                )}
                <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rounded-xl bg-light px-3 py-2">
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-sm">
                  {plan.id === currentPlan ? (
                    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-600">
                      Current plan
                    </span>
                  ) : plan.id === 'pro' ? (
                    <span className="text-slate-500">
                      Use the <strong>Upgrade via Whish</strong> button above to submit your payment proof.
                    </span>
                  ) : (
                    <span className="text-slate-500">Downgrade by contacting support.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
