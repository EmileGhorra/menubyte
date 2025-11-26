<link rel="icon" href="/logo.png" />
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://menubyte.e-nova.dev';
const title = 'MenuByte | QR Menu Generator for Restaurants';
const description =
  'Create and share beautiful QR menus, edit dishes in real time, and give guests a mobile-first ordering experience.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'MenuByte',
  keywords: ['QR menu', 'digital menu', 'restaurant menu', 'mobile menu', 'menu generator'],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'MenuByte',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'MenuByte QR Menu Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'MenuByte',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: siteUrl,
              description: 'Create and manage digital QR menus for restaurants.',
              offers: {
                '@type': 'Offer',
                price: '10',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="bg-light text-dark">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
