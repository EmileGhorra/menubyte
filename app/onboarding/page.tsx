import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';
import { OnboardingForm } from '@/components/OnboardingForm';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/onboarding');
  }

  const existingRestaurant = await getPrimaryRestaurantForUser(session.user?.id);
  if (existingRestaurant) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-light px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-400">Welcome</p>
          <h1 className="text-3xl font-semibold text-dark">Name your restaurant</h1>
          <p className="text-sm text-slate-500">
            Tell us a few basics so we can generate your QR menu and dashboard.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
