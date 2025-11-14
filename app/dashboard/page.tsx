import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MenuCard } from '@/components/MenuCard';
import { QRGenerator } from '@/components/QRGenerator';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrimaryRestaurantForUser } from '@/lib/data/restaurants';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const currentRestaurant = await getPrimaryRestaurantForUser(session.user?.id);
  if (!currentRestaurant) {
    redirect('/onboarding');
  }
  const stats = [
    { label: 'Items', value: currentRestaurant.categories.reduce((acc, cat) => acc + cat.items.length, 0).toString() },
    { label: 'Scans this week', value: '248' },
    { label: 'Active plan', value: currentRestaurant.restaurant.plan === 'pro' ? 'Pro' : 'Free' },
  ];
  const firstName = session.user?.name?.split(' ')[0] ?? 'Chef';

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} publicMenuHref={`/menus/${currentRestaurant.restaurant.slug}`} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar publicMenuHref={`/menus/${currentRestaurant.restaurant.slug}`} />
        <div className="space-y-6">
          <Header
            title={`Welcome back, ${firstName}`}
            description={session.user?.email ?? 'Keep your QR menu fresh and track engagement.'}
            stats={stats}
          />
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-dark">Recent menu items</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {currentRestaurant.categories.flatMap((cat) => cat.items.slice(0, 2)).map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </div>
            <QRGenerator slug={currentRestaurant.restaurant.slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
