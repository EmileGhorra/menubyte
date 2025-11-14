// NOTE: Keep navbar aware of hasRestaurant flag so onboarding CTA stays visible for new owners.
import type { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

type NavbarUser = Pick<NonNullable<Session['user']>, 'name' | 'email' | 'image'> | null;

interface NavbarProps {
  user?: (NavbarUser & { hasRestaurant?: boolean }) | null;
  publicMenuHref?: string;
}

export function Navbar({ user, publicMenuHref }: NavbarProps) {
  const publicMenuLink = publicMenuHref ?? '/menu';
  const initials =
    user?.name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'MB';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-dark">
          <Image src="/logo.svg" alt="MenuByte" width={32} height={32} />
          MenuByte
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <Link
            href={publicMenuLink}
            className="text-sm font-medium text-slate-600 hover:text-dark sm:order-none order-last"
          >
            Public Menus
          </Link>
          {user ? (
            <div className="flex flex-1 flex-wrap items-center gap-3 sm:flex-none sm:justify-end">
              {!user.hasRestaurant && (
                <Link
                  href="/onboarding"
                  className="hidden rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary sm:inline-flex"
                >
                  Create restaurant
                </Link>
              )}
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User avatar'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-dark">
                  {initials}
                </div>
              )}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-dark">{user.name ?? 'MenuByte member'}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white hover:bg-dark/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
