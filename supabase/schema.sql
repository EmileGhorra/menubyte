create extension if not exists "pgcrypto";

create table if not exists users (
  id text primary key,
  email text unique not null,
  name text,
  image text,
  password_hash text,
  plan_tier text not null default 'free',
  plan_status text not null default 'active',
  stripe_customer_id text,
  pro_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  hero_image text,
  address text,
  phone text,
  plan_tier text not null default 'free',
  qr_slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  base_price numeric(10,2) not null,
  price_mode text not null default 'fixed',
  unit_label text,
  image_url text,
  is_available boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists menu_item_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references menu_items(id) on delete cascade,
  label text not null,
  price numeric(10,2) not null,
  unit_label text,
  position int not null default 0
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  plan_tier text not null,
  status text not null default 'active',
  renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  slug text not null unique,
  static_url text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_categories_restaurant on menu_categories(restaurant_id, position);
create index if not exists idx_menu_items_category on menu_items(category_id, position);
create index if not exists idx_menu_item_options_item on menu_item_options(item_id, position);

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
  resolved_at timestamptz,
  unique(user_id, created_at)
);

create index if not exists idx_upgrade_requests_status on upgrade_requests(status, created_at desc);
