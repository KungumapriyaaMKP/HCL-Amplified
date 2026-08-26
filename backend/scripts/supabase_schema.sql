-- =============================================================================
-- Pathfinder Supabase PostgreSQL Schema
-- Migration: 001_auth_and_persistence.sql
-- Idempotent: safe to run multiple times in Supabase SQL Editor
-- =============================================================================

-- 1. Profiles Table (1:1 with auth.users or guest user)
create table if not exists public.profiles (
    user_id text primary key,
    display_name text,
    created_at timestamptz not null default now()
);

-- 2. Learner State (4D Model State: goals, target role, constraints, mastery)
create table if not exists public.learner_state (
    user_id text primary key,
    goal_text text default '',
    target_role text,
    constraints jsonb not null default '{}'::jsonb,
    mastery jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

-- 3. Learning Events (Single unified event stream for decay, streaks, analytics)
create table if not exists public.learning_events (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    type text not null,
    at timestamptz not null default now(),
    skill_id text,
    resource_id text,
    score real,
    minutes_spent real,
    payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_learning_events_user_at on public.learning_events(user_id, at desc);
create index if not exists idx_learning_events_user_skill on public.learning_events(user_id, skill_id);

-- 4. Saved Plans (Generated learning paths persisted across sessions)
create table if not exists public.saved_plans (
    id text primary key default gen_random_uuid()::text,
    user_id text not null,
    target_role text default '',
    goal text default '',
    plan_json jsonb not null default '{}'::jsonb,
    plan jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_saved_plans_user_created on public.saved_plans(user_id, created_at desc);

-- Enable Row Level Security (RLS) - best practice
alter table public.profiles enable row level security;
alter table public.learner_state enable row level security;
alter table public.learning_events enable row level security;
alter table public.saved_plans enable row level security;

-- Policies for authenticated users to access their own data
do $$
begin
    drop policy if exists "profiles_self" on public.profiles;
    drop policy if exists "Users can view own profile" on public.profiles;
    drop policy if exists "Users can update own profile" on public.profiles;
    drop policy if exists "Users can modify own profile" on public.profiles;
    drop policy if exists "Users can manage own learner_state" on public.learner_state;
    drop policy if exists "Users can manage own learning_events" on public.learning_events;
    drop policy if exists "Users can manage own saved_plans" on public.saved_plans;

    create policy "Users can view own profile" on public.profiles for select using (auth.uid()::text = user_id);
    create policy "Users can update own profile" on public.profiles for insert with check (auth.uid()::text = user_id);
    create policy "Users can modify own profile" on public.profiles for update using (auth.uid()::text = user_id);
    create policy "Users can manage own learner_state" on public.learner_state for all using (auth.uid()::text = user_id);
    create policy "Users can manage own learning_events" on public.learning_events for all using (auth.uid()::text = user_id);
    create policy "Users can manage own saved_plans" on public.saved_plans for all using (auth.uid()::text = user_id);
end $$;

