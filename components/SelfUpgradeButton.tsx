'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  disabled?: boolean;
  isPro?: boolean;
}

export function SelfUpgradeButton({ disabled, isPro }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/wallet/upgrade', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Unable to upgrade');
      }
      router.refresh();
    } catch (err) {
      setError(
        (err as Error).message.includes('Insufficient')
          ? 'Not enough balance to extend Pro. Top up via WhatsApp and try again.'
          : (err as Error).message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Processing…' : isPro ? 'Extend Pro with wallet' : 'Activate Pro with wallet'}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
