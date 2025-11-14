import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { isAdminUser, listPendingRequests } from '@/lib/wallet';
import { AdminUpgradeRequestsTable } from '@/components/AdminUpgradeRequestsTable';

export default async function AdminUpgradeRequestsPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    redirect('/login?callbackUrl=/admin/upgrade-requests');
  }

  const requests = await listPendingRequests();

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar />
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-400">Admin</p>
            <h1 className="text-3xl font-semibold text-dark">Upgrade requests</h1>
            <p className="text-sm text-slate-500">
              Review Whish payments, then approve or reject to update user accounts.
            </p>
          </div>
          <AdminUpgradeRequestsTable requests={requests} />
        </div>
      </main>
    </div>
  );
}
