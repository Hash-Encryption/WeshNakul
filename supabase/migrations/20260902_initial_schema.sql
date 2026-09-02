create extension if not exists "pgcrypto";

create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status text not null default 'lobby',       -- lobby, food_selection, restaurant_selection, completed, expired
  eating_mode text not null,                  -- delivery, dine_in, any
  city text not null,
  neighborhood text,
  language text not null default 'ar',        -- ar, en
  host_participant_id uuid,
  current_stage text not null default 'lobby',
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '3 hours'
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  session_token text unique not null,
  nickname text not null,
  player_color text not null,
  player_shape text not null,
  is_host boolean default false,
  status text not null default 'active',      -- active, away, disconnected
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

-- Performance Indexes
create index if not exists idx_rooms_code on rooms(code);
create index if not exists idx_participants_room on participants(room_id);
create index if not exists idx_participants_session on participants(session_token);

-- Row Level Security
alter table rooms enable row level security;
alter table participants enable row level security;

create policy "Public read/write for rooms" on rooms for all using (true) with check (true);
create policy "Public read/write for participants" on participants for all using (true) with check (true);

-- Enable Realtime
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table rooms;
