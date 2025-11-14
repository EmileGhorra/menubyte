import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RestaurantSettingsForm } from '@/components/RestaurantSettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/settings');
  }

  const restaurant = await getPrimaryRestaurantForUser(session.user?.id);
  if (!restaurant) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} publicMenuHref={`/menus/${restaurant.restaurant.slug}`} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar publicMenuHref={`/menus/${restaurant.restaurant.slug}`} />
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Restaurant</p>
            <h1 className="text-3xl font-semibold text-dark">Details & branding</h1>
            <p className="text-sm text-slate-500">
              Update the information guests see on your public menu.
            </p>
          </div>
          <RestaurantSettingsForm restaurant={restaurant.restaurant} />
        </div>
      </main>
    </div>
  );
}
