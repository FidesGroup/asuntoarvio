-- StatFin benchmark cache: one row per postal code x room class.
create table if not exists benchmarks (
  postal_code text not null,
  rooms_type text not null check (rooms_type in ('yksiöt', 'kaksiot', 'kolmiot+')),
  benchmark_eur_m2 integer,
  n_4q integer not null default 0,
  series jsonb not null default '[]',
  refreshed_at timestamptz not null default now(),
  primary key (postal_code, rooms_type)
);

alter table benchmarks enable row level security;
create policy "benchmarks are public read" on benchmarks for select using (true);
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
-- Stage 1: paid reports + the taloyhtiö scorecard cache (the moat asset).
-- The homeserver worker polls `reports` for status='paid', runs the extractor
-- container, writes scorecard JSON into `scorecards`, then marks 'done'.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'done', 'failed')),
  email text not null,
  listing_url text,
  facts jsonb not null,
  stripe_session_id text,
  scorecard_id bigint
);

create table if not exists scorecards (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  business_id text not null unique,          -- y-tunnus
  company_name text,
  fiscal_year integer,
  source_document text,                      -- virre document reference
  data jsonb not null,                       -- extracted scorecard (schema v0 in geo docs/tilinpaatos-spike.md)
  extraction_confidence numeric
);

alter table reports enable row level security;
alter table scorecards enable row level security;
-- no public policies: server-side (service role) access only
