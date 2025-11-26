import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { isAdminUser } from '@/lib/wallet';
import { supabaseServer } from '@/lib/supabaseServer';
import { AdminUsersTable, type AdminUserRow } from '@/components/AdminUsersTable';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const { data: users } = await supabaseServer
    .from('users')
    .select('id, email, name, plan_tier, plan_status, pro_expires_at, created_at')
    .order('created_at', { ascending: false });

  const totalUsers = users?.length ?? 0;
  const proUsers = (users ?? []).filter((user) => user.plan_tier === 'pro').length;

  return (
    <div className="min-h-screen bg-light">
      <Navbar user={session.user} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <Sidebar />
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-400">Admin</p>
            <h1 className="text-3xl font-semibold text-dark">Platform overview</h1>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total users</p>
                <p className="text-2xl font-semibold text-dark">{totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Pro accounts</p>
                <p className="text-2xl font-semibold text-dark">{proUsers}</p>
              </div>
            </div>
          </div>
          <AdminUsersTable users={(users as AdminUserRow[]) ?? []} />
        </div>
      </main>
    </div>
  );
}
