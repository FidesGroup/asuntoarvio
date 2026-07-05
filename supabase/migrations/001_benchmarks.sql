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
