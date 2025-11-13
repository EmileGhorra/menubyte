-- Run this script to retrofit existing databases with the new wallet + upgrade request flow.
-- It is idempotent, so it is safe to run multiple times.

begin;

create table if not exists wallets (
  user_id text primary key references users(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  amount numeric(12,2) not null,
  transaction_type text not null,
  reference text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  display_name text not null,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  status_message text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_upgrade_requests_status on upgrade_requests(status, created_at desc);

alter table users add column if not exists pro_expires_at timestamptz;

insert into wallets (user_id, balance)
select u.id, 0
from users u
left join wallets w on w.user_id = u.id
where w.user_id is null;

commit;
