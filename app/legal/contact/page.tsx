import Link from 'next/link';

export const metadata = {
  title: 'Contact | MenuByte',
};

const contactBlocks = [
  { label: 'Email', value: 'contact@e-novo.dev', href: 'mailto:contact@e-novo.dev' },
  { label: 'WhatsApp', value: '+961 81605898', href: 'https://wa.me/96181605898' },
  { label: 'Instagram', value: '@enova.dev', href: 'https://www.instagram.com/enova.dev' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-light px-4 py-12 text-slate-800">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Legal</p>
          <h1 className="text-3xl font-semibold text-dark">Contact & Imprint</h1>
          <p className="text-sm text-slate-600">
            Reach us for support, account help, or legal inquiries using the channels below.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {contactBlocks.map((contact) => (
            <div key={contact.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{contact.label}</p>
              <Link href={contact.href} className="text-lg font-semibold text-primary hover:text-secondary">
                {contact.value}
              </Link>
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Support hours</h2>
          <p className="text-sm text-slate-700">We usually respond within 1 business day.</p>
        </div>
      </div>
    </div>
  );
}
