-- Track menu scan totals per restaurant and provide an atomic increment helper.
begin;

create table if not exists restaurant_scans (
  restaurant_id uuid primary key references restaurants(id) on delete cascade,
  total bigint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function increment_scan(restaurant_uuid uuid)
returns void
language plpgsql
as $$
begin
  insert into restaurant_scans (restaurant_id, total, updated_at)
  values (restaurant_uuid, 1, now())
  on conflict (restaurant_id)
  do update set total = restaurant_scans.total + 1, updated_at = now();
end;
$$;

commit;
