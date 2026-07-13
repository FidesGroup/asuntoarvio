-- Detached-house benchmark cache: one row per 15hw region code.
-- Source: StatFin kihi table 15hw (old detached-house prices, regional,
-- quarterly), CC BY 4.0. Regions are the table's own area classification
-- (SSS whole country, pks Greater Helsinki, iso large cities, keh frame
-- municipalities, S01-S04 major regions) — StatFin publishes no
-- municipality-level detached-house price table, so this is the coarsest
-- honest tier the engine can anchor houses on (see statfin-houses.ts).

create table if not exists houses (
  region text primary key,
  benchmark_eur_m2 numeric,
  n_4q integer not null default 0,
  latest_quarter text,
  series jsonb not null default '[]',
  refreshed_at timestamptz not null default now()
);

alter table houses enable row level security;
create policy "houses are public read" on houses for select using (true);
-- writes are server-side (service role) only, via /api/refresh
