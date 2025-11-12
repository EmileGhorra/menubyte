import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MenuEditorForm } from '@/components/MenuEditorForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';

export default async function MenuEditorPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/menu-editor');
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
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Menu editor</p>
            <h1 className="text-3xl font-semibold text-dark">{restaurant.restaurant.name}</h1>
            <p className="text-sm text-slate-500">
              Add dishes, update photos, and keep your QR experience consistent.
            </p>
          </div>
          <MenuEditorForm
            categories={restaurant.categories}
            planType={restaurant.restaurant.plan}
            restaurantId={restaurant.restaurant.id}
          />
        </div>
      </main>
    </div>
  );
}
