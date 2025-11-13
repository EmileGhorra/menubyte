import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAllRestaurants, getPrimaryRestaurantForUser } from '@/lib/data/restaurants';
import { auth } from '@/auth';

export default async function MenuIndexPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/menu');
  }

  const restaurants = await getAllRestaurants();

  if (session.user.id) {
    const ownerRestaurant = await getPrimaryRestaurantForUser(session.user.id);
    if (ownerRestaurant) {
      redirect(`/menu/${ownerRestaurant.restaurant.slug}`);
    }
  }
  return (
    <div className="min-h-screen bg-light px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Menus</p>
          <h1 className="text-3xl font-semibold text-dark">Public menus</h1>
          <p className="text-sm text-slate-500">Share these links with your guests or print the QR code.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/menu/${restaurant.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {restaurant.heroImage ? (
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={restaurant.heroImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="h-2" />
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-xl font-semibold text-dark">{restaurant.name}</h3>
                <p className="text-sm text-slate-500">{restaurant.description}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {restaurant.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
