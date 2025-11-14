'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const baseLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/menu-editor', label: 'Menu Editor' },
  { href: '/dashboard/settings', label: 'Restaurant Settings' },
  { href: '/menu', label: 'Menu' },
  { href: '/billing', label: 'Billing' },
];

interface SidebarProps {
  publicMenuHref?: string;
}

export function Sidebar({ publicMenuHref }: SidebarProps = {}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="w-full">
      <button
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 sm:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Menu
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${isOpen ? 'block' : 'hidden sm:block'
          }`}
      >
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Manage</p>
        <nav className="flex flex-1 flex-col gap-1">
          {baseLinks.map((link) => {
            const targetHref = link.href === '/menu' && publicMenuHref ? publicMenuHref : link.href;
            const isActive = pathname === targetHref;
            return (
              <Link
                key={link.href}
                href={targetHref}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-primary/10 ${isActive ? 'bg-primary text-white' : 'text-slate-600'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
