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
