'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUpgradeRequest {
  id: string;
  display_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  status_message?: string | null;
  created_at: string;
  user_email?: string | null;
  restaurant_name?: string | null;
  request_mode?: 'upgrade' | 'extend';
}

interface Props {
  requests: AdminUpgradeRequest[];
}

export function AdminUpgradeRequestsTable({ requests }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [actionState, setActionState] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const review = (id: string, action: 'approve' | 'reject') => {
    setFeedback(null);
    setActionState({ id, action });
    startTransition(async () => {
      try {
        const response = await fetch('/api/upgrade-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? 'Unable to process request.');
        }
        setFeedback({
          tone: 'success',
          text: action === 'approve' ? 'Request approved and wallet updated.' : 'Request marked as rejected.',
        });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: 'error', text: (error as Error).message });
      } finally {
        setActionState(null);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {feedback && (
        <div
          className={`border-b px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.text}
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Requester</th>
            <th className="px-4 py-3">Restaurant</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                No requests yet.
              </td>
            </tr>
          )}
          {requests.map((request) => (
            <tr key={request.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <p className="font-semibold text-dark">{request.display_name}</p>
                <p className="text-xs text-slate-500">{request.user_email ?? request.id.slice(0, 8)}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-dark">{request.restaurant_name ?? '—'}</p>
                {request.request_mode && (
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      request.request_mode === 'extend'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {request.request_mode}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-semibold text-dark">${request.amount}</td>
              <td className="px-4 py-3 capitalize text-slate-600">{request.status}</td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(request.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-2">
                  <button
                    disabled={
                      isPending || request.status !== 'pending' || actionState?.action === 'reject' || Boolean(actionState?.id && actionState.id !== request.id)
                    }
                    onClick={() => review(request.id, 'approve')}
                    className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionState?.id === request.id && actionState.action === 'approve' ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    disabled={
                      isPending || request.status !== 'pending' || actionState?.action === 'approve' || Boolean(actionState?.id && actionState.id !== request.id)
                    }
                    onClick={() => review(request.id, 'reject')}
                    className="rounded-full border border-rose-500 px-3 py-1 text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionState?.id === request.id && actionState.action === 'reject' ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
