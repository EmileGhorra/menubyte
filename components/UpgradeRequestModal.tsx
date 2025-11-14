'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  amount: number;
  defaultName: string;
  pendingStatus?: 'pending' | 'approved' | 'rejected';
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '81605898';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`;
const WHATSAPP_BUTTON_SRC = '/assets/whatsapp-button.png';

export function UpgradeRequestModal({ amount, defaultName, pendingStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Please enter the name that appears on the Whish transfer.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setNameError('');
    try {
      const response = await fetch('/api/upgrade-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmedName }),
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

  const buttonLabel = success || pendingStatus === 'pending' ? 'Pending approval' : 'Add funds';

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setSuccess(false);
          setError(null);
          setNameError('');
        }}
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
                <h2 className="text-2xl font-semibold text-dark">Confirm your payment</h2>
                <p className="text-sm text-slate-500">
                  Send ${amount} via Whish, then submit this request and message us on WhatsApp with your receipt. We&apos;ll match the payment
                  and credit your wallet.
                </p>
              </div>
              <button
                className="text-slate-400 hover:text-dark"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setNameError('');
                  setSuccess(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                <p className="text-sm font-semibold text-dark">Steps</p>
                <ol className="mt-3 space-y-2 text-sm">
                  <li>1. Pay ${amount} via Whish.</li>
                  <li>2. Tap the WhatsApp button below and share your receipt + restaurant name.</li>
                  <li>3. Submit this request so we can verify and add the funds.</li>
                </ol>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-4 inline-block">
                  <Image
                    src={WHATSAPP_BUTTON_SRC}
                    alt={`Chat with us on WhatsApp (${WHATSAPP_NUMBER})`}
                    width={220}
                    height={70}
                    className="h-auto w-44 md:w-56"
                  />
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
                    onChange={(event) => {
                      setName(event.target.value);
                      if (nameError) setNameError('');
                    }}
                    className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm focus:ring-1 ${
                      nameError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-primary focus:ring-primary'
                    }`}
                    placeholder="Restaurant or owner name"
                  />
                  {nameError && <span className="text-xs text-rose-600">{nameError}</span>}
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
                    We received your request—make sure you reached out on WhatsApp so we can confirm the transfer quickly.
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
