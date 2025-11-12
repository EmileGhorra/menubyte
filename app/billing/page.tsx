import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { subscriptionPlans } from '@/menuData';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';

export default async function BillingPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/billing');
  }
  const restaurant = await getPrimaryRestaurantForUser(session.user?.id);
  if (!restaurant) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar />
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-400">Billing</p>
            <h1 className="text-3xl font-semibold text-dark">Choose your plan</h1>
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-semibold text-dark">{session.user?.email}</span>. Upgrade to remove ads
              and unlock unlimited items for{' '}
              <span className="font-semibold text-dark">{restaurant.restaurant.name}</span>.
            </p>
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
                <button className="mt-6 rounded-2xl bg-dark py-2 text-sm font-semibold text-white">
                  {plan.id === restaurant.restaurant.plan ? 'Current plan' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
