import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | MenuByte',
};

const contactBlocks = [
  { label: 'Email', value: 'contact@e-nova.dev', href: 'mailto:contact@e-nova.dev' },
  { label: 'WhatsApp', value: '+961 81605898', href: 'https://wa.me/96181605898' },
  { label: 'Instagram', value: '@enova.dev', href: 'https://www.instagram.com/enova.dev' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-light px-4 py-12 text-slate-800">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Legal</p>
          <h1 className="text-3xl font-semibold text-dark">Terms of Service</h1>
          <p className="text-sm text-slate-600">
            By using MenuByte, you agree to these terms. This is a concise summary to make expectations clear.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Using MenuByte</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>You must provide accurate account details and keep credentials secure.</li>
            <li>You are responsible for the content you publish on your public menus.</li>
            <li>Do not misuse the service (no abuse, spam, or unlawful activity).</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Plans & billing</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Free plan limits apply (item cap, image uploads gated to Pro).</li>
            <li>Manual wallet top-ups and admin approvals control Pro activation.</li>
            <li>Pro access may expire if balances are insufficient; downgrades reapply limits.</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Content & uptime</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>We aim to keep the service available but uptime is not guaranteed.</li>
            <li>We may update features; breaking changes will be communicated when possible.</li>
            <li>We may remove content that violates these terms or applicable laws.</li>
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Liability</h2>
          <p className="text-sm text-slate-700">
            MenuByte is provided “as is” without warranties. To the extent permitted by law, our liability is limited to
            the fees paid for the service. You are responsible for compliance with local regulations on menu disclosures.
          </p>
        </div>

        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">Contact</h2>
          <p className="text-sm text-slate-700">Need help with these terms? Reach out.</p>
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
