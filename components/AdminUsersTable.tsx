'use client';

import { useState } from 'react';

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  plan_tier: string | null;
  plan_status: string | null;
  pro_expires_at: string | null;
  created_at: string | null;
};

interface Props {
  users: AdminUserRow[];
}

export function AdminUsersTable({ users }: Props) {
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleGrantPro = async (userId: string) => {
    setGrantingId(userId);
    setMessage('');
    try {
      const response = await fetch('/api/admin/users/grant-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to grant Pro');
      }
      setMessage('Pro plan granted successfully.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setGrantingId(null);
    }
  };

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Users</p>
          <h2 className="text-2xl font-semibold text-dark">Accounts overview</h2>
        </div>
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Pro expires</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isPro = user.plan_tier === 'pro';
              const expiresLabel = user.pro_expires_at
                ? dateFormatter.format(new Date(user.pro_expires_at))
                : '—';
              return (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-dark">{user.name ?? '—'}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2 capitalize">{user.plan_tier ?? 'free'}</td>
                  <td className="px-3 py-2 capitalize">{user.plan_status ?? 'inactive'}</td>
                  <td className="px-3 py-2">{expiresLabel}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary disabled:opacity-50"
                      onClick={() => handleGrantPro(user.id)}
                      disabled={isPro && !user.pro_expires_at ? true : grantingId === user.id}
                    >
                      {grantingId === user.id ? 'Granting…' : 'Grant Pro month'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
