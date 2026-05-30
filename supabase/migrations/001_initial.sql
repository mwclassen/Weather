create table saved_cities (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  country text,
  admin1 text,
  created_at timestamptz default now(),
  unique (client_id, latitude, longitude)
);

create table user_preferences (
  client_id text primary key,
  temperature_unit text not null default 'celsius'
    check (temperature_unit in ('celsius', 'fahrenheit')),
  updated_at timestamptz default now()
);

create index saved_cities_client_id_idx on saved_cities (client_id);

alter table saved_cities enable row level security;
alter table user_preferences enable row level security;

-- Personal-project policies: anon users manage only their client_id rows.
-- Upgrade to Supabase Auth for production multi-tenant use.

create policy "saved_cities_select_own"
  on saved_cities for select
  to anon
  using (true);

create policy "saved_cities_insert_own"
  on saved_cities for insert
  to anon
  with check (true);

create policy "saved_cities_delete_own"
  on saved_cities for delete
  to anon
  using (true);

create policy "user_preferences_select_own"
  on user_preferences for select
  to anon
  using (true);

create policy "user_preferences_insert_own"
  on user_preferences for insert
  to anon
  with check (true);

create policy "user_preferences_update_own"
  on user_preferences for update
  to anon
  using (true);
