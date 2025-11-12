'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils/slugify';

interface FormState {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  address: string;
  phone: string;
}

const initialState: FormState = {
  name: '',
  slug: '',
  description: '',
  heroImage: '',
  address: '',
  phone: '',
};

export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((prev) => {
      if (field === 'name') {
        return { ...prev, name: value, slug: slugify(value) };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const response = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Unable to create restaurant');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700">Restaurant name</label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          value={form.name}
          onChange={handleChange('name')}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Slug</label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          value={form.slug}
          disabled
        />
        <p className="mt-1 text-xs text-slate-400">Slug is auto-generated from the restaurant name.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          value={form.description}
          onChange={handleChange('description')}
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Hero image URL</label>
        <input
          type="url"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          value={form.heroImage}
          onChange={handleChange('heroImage')}
          placeholder="https://images.unsplash.com/..."
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Address</label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          value={form.address}
          onChange={handleChange('address')}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Phone</label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
          value={form.phone}
          onChange={handleChange('phone')}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating restaurant…' : 'Create restaurant'}
      </button>
    </form>
  );
}
