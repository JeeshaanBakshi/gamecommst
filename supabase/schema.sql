-- The Waterloo Effect: How Not to Go Bald
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to re-run.

create extension if not exists pgcrypto;

-- ---------- tables ----------

create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[A-Z]{4}$'),
  created_at  timestamptz not null default now()
);

create table if not exists public.game_state (
  room_id     uuid primary key references public.rooms(id) on delete cascade,
  screen      int not null default 0,
  revealed    boolean not null default false,
  locked      boolean not null default false,
  started_at  timestamptz,
  epoch       int not null default 0,
  rev         int not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  nickname    text not null check (char_length(nickname) between 1 and 24),
  emoji       text not null check (char_length(emoji) <= 16),
  is_fake     boolean not null default false,
  epoch       int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists players_room_idx on public.players(room_id);

create table if not exists public.answers (
  id          bigint generated always as identity primary key,
  room_id     uuid not null references public.rooms(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  question    text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  unique (player_id, question)
);
create index if not exists answers_room_idx on public.answers(room_id);

-- ---------- server clock (keeps timers in sync across phones) ----------

create or replace function public.server_now()
returns timestamptz
language sql
stable
as $$ select now() $$;

grant execute on function public.server_now() to anon, authenticated;

-- ---------- row level security ----------
-- This is a no-login classroom game, so the anon key may read/write game tables.
-- Rooms are only discoverable by their 4-letter code. Don't store anything sensitive here.

alter table public.rooms      enable row level security;
alter table public.game_state enable row level security;
alter table public.players    enable row level security;
alter table public.answers    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['rooms', 'game_state', 'players', 'answers'] loop
    execute format('drop policy if exists "anon all %1$s" on public.%1$I', t);
    execute format(
      'create policy "anon all %1$s" on public.%1$I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ---------- realtime ----------

do $$
declare t text;
begin
  foreach t in array array['game_state', 'players', 'answers'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
