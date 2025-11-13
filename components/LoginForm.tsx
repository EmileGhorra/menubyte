'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl: '/dashboard' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsEmailLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      setIsEmailLoading(false);
      return;
    }

    window.location.href = result?.url ?? '/dashboard';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-light to-secondary/10 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-slate-400">Welcome back</p>
        <h1 className="text-3xl font-semibold text-dark">Sign in to MenuByte</h1>
        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="you@restaurant.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
              disabled={isEmailLoading}
            >
              {isEmailLoading ? 'Signing in…' : 'Continue'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{' '}
          <Link href="/signup" className="font-semibold text-primary">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
