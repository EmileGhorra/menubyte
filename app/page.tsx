import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-light text-dark">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="MenuByte" width={36} height={36} />
          <span className="text-lg font-semibold text-dark">MenuByte</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/login" className="text-slate-600 hover:text-dark">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            Start free
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-6 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              QR menus • Mobile friendly • Easy updates
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl text-dark">
              Launch a beautiful QR menu your guests love.
            </h1>
            <p className="text-lg text-slate-600">
              MenuByte gives you editable QR menus, mobile-first layouts, and effortless sharing so you can focus on
              serving guests.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                Create your menu
              </Link>
              <Link
                href="https://menubyte.e-nova.dev/menus/atlas-demo"
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                View demo menu
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-semibold text-dark">20 items</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Starter limit</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark">Mobile ready</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">No pinching/zooming</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark">Live edits</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Instant updates</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-dark">QR ready</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Share instantly</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-100">
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative space-y-4 rounded-2xl border border-slate-100 bg-light p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10" />
                  <div>
                    <p className="text-sm font-semibold text-dark">Atlas Kitchen & Bar</p>
                    <p className="text-xs text-slate-500">Beirut Waterfront</p>
                  </div>
                </div>
                <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Live</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Categories</p>
                  <p className="text-xl font-semibold text-dark">6</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Items</p>
                  <p className="text-xl font-semibold text-dark">38</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Theme</p>
                  <p className="text-xl font-semibold text-dark">Light</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20">
                  Generate QR
                </button>
                <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300">
                  Edit menu items
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Fast setup</p>
            <p className="text-sm text-slate-600">
              Create a menu in minutes with categories, prices, and photos. QR codes update as you edit.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mobile-friendly editor</p>
            <p className="text-sm text-slate-600">
              Drag to reorder categories and items, double-tap on mobile, and keep public menus in sync instantly.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Smart limits</p>
            <p className="text-sm text-slate-600">
              Free plans show up to 20 items; add photos and unlimited items when you need to grow.
            </p>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-100 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-slate-500">How it works</p>
            <h2 className="text-3xl font-semibold text-dark">From QR to menu in minutes</h2>
            <ol className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-center text-sm font-semibold text-primary">1</span>
                Generate a QR linked to `/menus/slug` so guests always see your live menu.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-center text-sm font-semibold text-primary">2</span>
                Add categories and dishes; reorder and edit anytime from your dashboard.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-primary/10 text-center text-sm font-semibold text-primary">3</span>
                Share or print the QR—changes go live instantly for your guests.
              </li>
            </ol>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                Start free
              </Link>
              <Link
                href="https://menubyte.e-nova.dev/menus/atlas-demo"
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Try the demo menu
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-light p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-transparent" />
            <div className="relative grid gap-3 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Menu editing</p>
                <p className="text-sm text-slate-600">Reorder categories and items; uploads unlocked on Pro.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Public QR</p>
                <p className="text-sm text-slate-600">Guests see ads on free; Pro removes ads and lifts limits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
