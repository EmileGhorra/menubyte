import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | MenuByte',
};

const contactBlocks = [
  { label: 'Email', value: 'contact@e-nova.dev', href: 'mailto:contact@e-nova.dev' },
  { label: 'WhatsApp', value: '+961 81605898', href: 'https://wa.me/96181605898' },
  { label: 'Instagram', value: '@enova.dev', href: 'https://www.instagram.com/enova.dev' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-light px-4 py-12 text-slate-800">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Legal</p>
          <h1 className="text-3xl font-semibold text-dark">Privacy Policy</h1>
          <p className="text-sm text-slate-600">
            We explain how MenuByte collects, uses, and protects your data. This summary is for convenience; for any
            questions, reach out using the contacts below.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Account data: name, email, and authentication tokens required to sign in.</li>
            <li>Restaurant data: menu items, categories, uploaded images, and QR slugs you choose to store.</li>
            <li>Operational data: logs and analytics needed to keep the service reliable and secure.</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">How we use data</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Provide and improve the MenuByte app experience (menus, dashboards, and QR sharing).</li>
            <li>Authenticate users and secure your account with next-auth and Supabase.</li>
            <li>Communicate important updates about your account or service changes.</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Data sharing</h2>
          <p className="text-sm text-slate-700">
            We do not sell your data. Third parties are limited to infrastructure (hosting, storage, authentication) and
            only receive what is necessary to operate the service.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Your choices</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Update or delete your restaurant and menu data from within the dashboard.</li>
            <li>Request account deletion by contacting us using the details below.</li>
            <li>Control the data you publish publicly via your QR menu.</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Contact</h2>
          <p className="text-sm text-slate-700">Questions about privacy? Reach out anytime.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {contactBlocks.map((contact) => (
              <div key={contact.label} className="rounded-2xl border border-slate-200 bg-light p-3 text-sm font-semibold text-dark">
                <p className="text-xs uppercase tracking-wide text-slate-500">{contact.label}</p>
                <Link href={contact.href} className="text-primary hover:text-secondary">
                  {contact.value}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
