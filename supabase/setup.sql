-- =========================================================
-- FC Chalosse — installation de la base de données
-- À coller dans Supabase → SQL Editor → Run
-- =========================================================

create schema if not exists private;

-- ---------- Tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null default 'utilisateur'
    check (role in ('admin', 'utilisateur')),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null
    check (char_length(first_name) between 1 and 80),
  last_name text not null
    check (char_length(last_name) between 1 and 80),
  position text not null
    check (position in ('Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Coach')),
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  team_type text not null check (team_type in ('premiere', 'reserve')),
  opponent text not null check (char_length(opponent) between 1 and 80),
  match_date date not null,
  opponent_logo text null
    check (
      opponent_logo is null
      or (
        char_length(opponent_logo) <= 500
        and opponent_logo like 'https://%'
        and opponent_logo !~* '%javascript:%'
      )
    ),
  score_chalosse integer null,
  score_adversaire integer null,
  created_at timestamptz not null default now(),
  check (
    (score_chalosse is null and score_adversaire is null)
    or (
      score_chalosse is not null
      and score_adversaire is not null
      and score_chalosse between 0 and 99
      and score_adversaire between 0 and 99
    )
  )
);

create table if not exists public.match_lineups (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  primary key (match_id, player_id)
);

create table if not exists public.match_stats (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  yellow_cards integer not null default 0 check (yellow_cards >= 0),
  red_cards integer not null default 0 check (red_cards >= 0),
  primary key (match_id, player_id)
);

create table if not exists public.ratings (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  voter_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric not null check (rating >= 0 and rating <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (match_id, player_id, voter_id)
);

-- ---------- Fonctions ----------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  assigned_role text := 'utilisateur';
begin
  -- Le premier compte devient admin
  if not exists (select 1 from public.profiles) then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'first_name', ''), 'Prénom'),
    coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), 'Nom'),
    coalesce(new.email, ''),
    assigned_role
  );

  -- Pas de validation e-mail : connexion immédiate
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = new.id;

  return new;
end;
$$;

create or replace function private.lock_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.role := old.role;
  new.id := old.id;
  return new;
end;
$$;

-- ---------- Triggers ----------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists trg_lock_profile_role on public.profiles;
create trigger trg_lock_profile_role
  before update on public.profiles
  for each row execute function private.lock_profile_role();

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_lineups enable row level security;
alter table public.match_stats enable row level security;
alter table public.ratings enable row level security;

-- profiles
drop policy if exists profiles_select_auth on public.profiles;
create policy profiles_select_auth on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (private.is_admin() and id <> auth.uid());

-- players
drop policy if exists players_select on public.players;
create policy players_select on public.players
  for select to authenticated using (true);
drop policy if exists players_insert_admin on public.players;
create policy players_insert_admin on public.players
  for insert to authenticated with check (private.is_admin());
drop policy if exists players_update_admin on public.players;
create policy players_update_admin on public.players
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists players_delete_admin on public.players;
create policy players_delete_admin on public.players
  for delete to authenticated using (private.is_admin());

-- matches
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches
  for select to authenticated using (true);
drop policy if exists matches_insert_admin on public.matches;
create policy matches_insert_admin on public.matches
  for insert to authenticated with check (private.is_admin());
drop policy if exists matches_update_admin on public.matches;
create policy matches_update_admin on public.matches
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists matches_delete_admin on public.matches;
create policy matches_delete_admin on public.matches
  for delete to authenticated using (private.is_admin());

-- match_lineups
drop policy if exists lineups_select on public.match_lineups;
create policy lineups_select on public.match_lineups
  for select to authenticated using (true);
drop policy if exists lineups_insert_admin on public.match_lineups;
create policy lineups_insert_admin on public.match_lineups
  for insert to authenticated with check (private.is_admin());
drop policy if exists lineups_update_admin on public.match_lineups;
create policy lineups_update_admin on public.match_lineups
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists lineups_delete_admin on public.match_lineups;
create policy lineups_delete_admin on public.match_lineups
  for delete to authenticated using (private.is_admin());

-- match_stats
drop policy if exists stats_select on public.match_stats;
create policy stats_select on public.match_stats
  for select to authenticated using (true);
drop policy if exists stats_insert_admin on public.match_stats;
create policy stats_insert_admin on public.match_stats
  for insert to authenticated with check (private.is_admin());
drop policy if exists stats_update_admin on public.match_stats;
create policy stats_update_admin on public.match_stats
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists stats_delete_admin on public.match_stats;
create policy stats_delete_admin on public.match_stats
  for delete to authenticated using (private.is_admin());

-- ratings
drop policy if exists ratings_select on public.ratings;
create policy ratings_select on public.ratings
  for select to authenticated using (true);
drop policy if exists ratings_insert_own on public.ratings;
create policy ratings_insert_own on public.ratings
  for insert to authenticated with check (voter_id = auth.uid());
drop policy if exists ratings_update_own on public.ratings;
create policy ratings_update_own on public.ratings
  for update to authenticated
  using (voter_id = auth.uid())
  with check (voter_id = auth.uid());

-- ---------- Droits ----------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;
