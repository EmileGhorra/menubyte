// NOTE: This component is only used in the owner dashboard; public menus hide downloadable QR assets.
import Image from 'next/image';
import { buildQrUrl } from '@/lib/qr';

interface Props {
  slug: string;
  title?: string;
  allowDownload?: boolean;
}

export function QRGenerator({ slug, title = 'Your public menu', allowDownload = true }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://menubyte.vercel.app';
  const menuUrl = `${baseUrl}/menu/${slug}`;
  const qrUrl = buildQrUrl(menuUrl);

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-center shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-400">QR Code</p>
      <h3 className="text-xl font-semibold text-dark">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">
        Print once and keep using it—this QR always points to your live menu.
      </p>
      <div className="mt-4 flex justify-center">
        <Image
          src={qrUrl}
          alt={`QR code for ${menuUrl}`}
          width={220}
          height={220}
          className="rounded-xl border border-white shadow-md"
        />
      </div>
      {allowDownload && (
        <a
          href={qrUrl}
          download={`menu-${slug}-qr.png`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Download QR
        </a>
      )}
    </div>
  );
}
