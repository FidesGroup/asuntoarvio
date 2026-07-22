-- Consent audit trail (GDPR Art. 7(1) proof-of-consent) + a waitlist
-- marketing opt-in, separate from the cookie-banner's marketing category.
-- See docs/MINIMAXGDPR_PLAN.md.
create table if not exists consent_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  consent_version smallint not null,
  necessary boolean not null default true,
  analytics boolean not null,
  marketing boolean not null,
  action text not null check (action in ('accept_all', 'reject_all', 'custom', 'withdraw')),
  source_path text
);
create index if not exists consent_log_visitor_idx on consent_log (visitor_id, created_at);
alter table consent_log enable row level security;
-- no public policies: server-side (service role) writes only, same convention
-- as query_log/leads

alter table leads add column if not exists marketing_opt_in boolean not null default false;
