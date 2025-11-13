'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  amount: number;
  defaultName: string;
  qrImageUrl?: string;
  paymentUrl: string;
  pendingStatus?: 'pending' | 'approved' | 'rejected';
}

const QR_FALLBACK_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=';

export function UpgradeRequestModal({ amount, defaultName, qrImageUrl, paymentUrl, pendingStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/upgrade-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Unable to submit request');
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = success || pendingStatus === 'pending' ? 'Pending approval' : 'Add funds via Whish';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={pendingStatus === 'pending'}
        className="rounded-2xl bg-dark px-4 py-2 text-sm font-semibold text-white hover:bg-dark/90 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {buttonLabel}
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Upgrade request</p>
                <h2 className="text-2xl font-semibold text-dark">Pay with Whish</h2>
                <p className="text-sm text-slate-500">
                  Scan the QR, send ${amount}, then submit this request. We’ll credit your wallet and keep your Pro plan in sync.
                </p>
              </div>
              <button className="text-slate-400 hover:text-dark" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                <Image
                  src={
                    qrImageUrl ||
                    `${QR_FALLBACK_BASE}${encodeURIComponent(paymentUrl)}`
                  }
                  alt="Whish QR code"
                  width={220}
                  height={220}
                  className="mx-auto rounded-2xl"
                />
                <p className="mt-3 text-sm text-slate-500">Whish QR • include your name in the note</p>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-dark px-4 py-2 text-xs font-semibold text-white hover:bg-dark/90"
                >
                  Open Whish link
                </a>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</label>
                  <p className="text-3xl font-semibold text-dark">${amount}</p>
                  <p className="text-xs text-slate-500">Paid in USD equivalent via Whish transfer</p>
                </div>
                <label className="block text-sm font-medium text-dark">
                  Account name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Restaurant or owner name"
                  />
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || success || pendingStatus === 'pending'}
                  className="w-full rounded-2xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {success ? 'Request submitted' : submitting ? 'Submitting…' : 'Submit request'}
                </button>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                {(success || pendingStatus === 'pending') && (
                  <p className="text-sm text-amber-600">
                    We received your request. You’ll get an email once it’s approved.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
