// NOTE: Pure server wrapper—client interactivity (search/filter) lives in PublicMenuClient.
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getRestaurantMenuBySlug } from '@/lib/data/restaurants';
import { PublicMenuClient } from '@/components/PublicMenuClient';

type Params = { itemId: string };
type PageProps = { params: Params | Promise<Params> };

export default async function PublicMenuPage({ params }: PageProps) {
  const resolvedParams = typeof (params as any)?.then === 'function' ? await params : (params as Params);
  const restaurantEntry = await getRestaurantMenuBySlug(resolvedParams.itemId);

  if (!restaurantEntry) {
    notFound();
  }

  const { restaurant, categories, featuredItems, isFallback } = restaurantEntry;
  const isFreePlan = restaurant.plan === 'free';

  return (
    <div className="min-h-screen bg-light">
      <div className="relative h-64 w-full">
        {restaurant.heroImage ? (
          <Image
            src={restaurant.heroImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark to-dark/70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40" />
        <div className="absolute inset-x-0 bottom-6 mx-auto max-w-5xl px-4 text-white">
          <p className="text-sm uppercase tracking-wide text-white/80">Menu</p>
          <h1 className="text-4xl font-semibold">{restaurant.name}</h1>
          <p className="text-sm text-white/80">{restaurant.description}</p>
          <p className="text-xs uppercase tracking-wide text-white/70">{restaurant.address}</p>
        </div>
      </div>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <PublicMenuClient
          restaurant={restaurant}
          categories={categories}
          featuredItems={featuredItems}
          isFreePlan={isFreePlan}
          isFallback={Boolean(isFallback)}
        />
        <div className="space-y-4 lg:w-80">
          {isFreePlan && (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">MenuByte Free Plan</p>
              <p className="text-amber-600">Guests may see ads until you upgrade.</p>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            <p className="font-semibold text-dark">Questions?</p>
            <p>{restaurant.phone}</p>
          </div>
          {isFallback && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">Live menu updating</p>
              <p>
                This QR is temporarily showing our sample menu while the owner finishes setup. Please contact the
                restaurant for the latest offerings.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
