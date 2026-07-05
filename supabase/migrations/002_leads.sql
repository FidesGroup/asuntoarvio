-- Demand metrics: every benchmark query + optional email capture.
create table if not exists query_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  postal_code text not null,
  rooms_type text not null,
  living_area_m2 numeric,
  price_eur numeric,
  delta_pct numeric,
  confidence text
);

create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'landing'
);

alter table query_log enable row level security;
alter table leads enable row level security;
-- no public policies: server-side (service role) writes only
