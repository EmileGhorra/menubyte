import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : null;

const remotePatterns: RemotePattern[] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'api.qrserver.com' },
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  { protocol: 'https', hostname: 'www.pexels.com' },
];

if (supabaseHost) {
  remotePatterns.push({
    protocol: 'https',
    hostname: supabaseHost,
    pathname: '/storage/**',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
