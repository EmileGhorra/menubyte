'use client';

import { useRef, useState } from 'react';
import { InlineSpinner } from './InlineSpinner';
import type { RestaurantProfile } from '@/types/menu';
import { UploadButton } from './UploadButton';
import { slugify } from '@/lib/utils/slugify';

interface Props {
  restaurant: RestaurantProfile;
}

// NOTE: Used on /dashboard/settings; keep fields in sync with Supabase restaurants schema.
export function RestaurantSettingsForm({ restaurant }: Props) {
  const [form, setForm] = useState({
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    heroImage: restaurant.heroImage,
    address: restaurant.address,
    phone: restaurant.phone,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ slug?: string }>({});
  const slugInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    setError('');
    setFieldErrors({});

    const response = await fetch('/api/restaurants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: restaurant.id,
        name: form.name,
        description: form.description,
        heroImage: form.heroImage,
        address: form.address,
        phone: form.phone,
        slug: slugify(form.slug),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 409) {
        setFieldErrors({ slug: data.error ?? 'Slug already exists. Choose another one.' });
        slugInputRef.current?.focus();
      } else {
        setError(data.error ?? 'Unable to update restaurant');
      }
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
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
        <div
          className={`mt-2 flex items-center rounded-2xl border bg-white px-3 py-2 ${
            fieldErrors.slug ? 'border-rose-400 ring-1 ring-rose-400/40' : 'border-slate-200'
          }`}
        >
          <span className="text-sm text-slate-500">/menu/</span>
          <input
            type="text"
            className="ml-2 flex-1 border-none bg-transparent text-sm text-dark focus:outline-none"
            value={form.slug}
            onChange={handleChange('slug')}
            pattern="^[a-z0-9-]+$"
            title="Use lowercase letters, numbers, or dashes."
            required
            ref={slugInputRef}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Example: <span className="font-mono text-slate-500">/menu/{form.slug || 'your-slug'}</span>. QR codes update automatically after saving.
        </p>
        {fieldErrors.slug && <p className="text-xs text-rose-600">{fieldErrors.slug}</p>}
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
        <label className="text-sm font-medium text-slate-700">Hero image</label>
        <div className="mt-2 space-y-2">
          <input
            type="url"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            value={form.heroImage}
            onChange={handleChange('heroImage')}
            placeholder="https://images.unsplash.com/..."
          />
          <UploadButton onUpload={(url) => setForm((prev) => ({ ...prev, heroImage: url }))}>
            Upload hero image
          </UploadButton>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Address
          <input
            type="text"
            className="mt-2 rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            value={form.address}
            onChange={handleChange('address')}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Phone
          <input
            type="text"
            className="mt-2 rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            value={form.phone}
            onChange={handleChange('phone')}
          />
        </label>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {status === 'success' && (
        <p className="flex items-center gap-2 text-sm text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Saved!
        </p>
      )}
      {status === 'saving' && <InlineSpinner label="Saving…" />}
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-70"
          disabled={status === 'saving'}
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
