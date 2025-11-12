'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Something went wrong');
      setStatus('error');
      return;
    }

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-light to-secondary/10 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-slate-400">Start free</p>
        <h1 className="text-3xl font-semibold text-dark">Create your MenuByte account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              value={form.name}
              onChange={handleChange('name')}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              value={form.email}
              onChange={handleChange('email')}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              value={form.password}
              onChange={handleChange('password')}
            />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button className="font-semibold text-primary" onClick={() => router.push('/login')}>
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
}
