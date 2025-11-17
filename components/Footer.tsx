import Link from 'next/link';

const links = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/contact', label: 'Contact' },
];

const contactLinks = [
  { href: 'mailto:contact@e-novo.dev', label: 'contact@e-novo.dev' },
  { href: 'https://wa.me/96181608598', label: 'WhatsApp: +961 81608598' },
  { href: 'https://www.instagram.com/enova.dev', label: 'Instagram: @enova.dev' },
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
            <Link key={contact.href} href={contact.href} className="hover:text-primary">
              {contact.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500 sm:text-right">© {year} E-Nova. All rights reserved.</p>
      </div>
    </footer>
  );
}
