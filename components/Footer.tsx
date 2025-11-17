import Link from 'next/link';

const links = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/contact', label: 'Contact' },
];

const contactLinks = [
  { href: 'mailto:contact@e-novo.dev', label: 'contact@e-novo.dev', icon: null },
  {
    href: 'https://wa.me/96181605898',
    label: '+961 81605898',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 text-[10px] font-bold text-white">
        WA
      </span>
    ),
  },
  {
    href: 'https://www.instagram.com/enova.dev',
    label: '@enova.dev',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-[10px] font-bold text-white">
        IG
      </span>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-600 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:justify-end">
          {contactLinks.map((contact) => (
            <Link
              key={contact.href}
              href={contact.href}
              className="flex items-center gap-2 hover:text-primary"
            >
              {contact.icon}
              <span>{contact.label}</span>
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500 sm:text-right">© {year} E-Nova. All rights reserved.</p>
      </div>
    </footer>
  );
}
