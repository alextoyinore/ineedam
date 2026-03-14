-- =================================================================================
-- iNeedAm Full Supabase SQL Schema
-- Run this entire script in your Supabase SQL Editor to set up the database
-- =================================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =================================================================================
-- 1. PROFILES TABLE
-- Stores user display names, avatars, and bios. Links to the auth.users table.
-- =================================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  username text unique,
  avatar_url text,
  banner_url text,
  bio text,
  newsletter_subscribed boolean default false,
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =================================================================================
-- 2. NEEDS TABLE (The core "posts" in the feed)
-- =================================================================================
create table public.needs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  budget_mode text not null, -- 'fixed', 'range', 'hourly'
  budget_min numeric,
  budget_max numeric,
  currency text default '$',
  location text,
  flexibility text,
  image_url text,
  status text default 'open', -- 'open', 'fulfilled', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.needs enable row level security;

create policy "Anyone can view needs" on needs for select using (true);
create policy "Users can insert their own needs" on needs for insert with check (auth.uid() = user_id);
create policy "Users can update their own needs" on needs for update using (auth.uid() = user_id);
create policy "Users can delete their own needs" on needs for delete using (auth.uid() = user_id);


-- =================================================================================
-- 3. REPLIES TABLE (Public thread comments under a Need)
-- =================================================================================
create table public.replies (
  id uuid default gen_random_uuid() primary key,
  need_id uuid references public.needs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.replies(id) on delete cascade,
  content text not null,
  is_private boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.replies enable row level security;

-- Public and Private View Policy
create policy "Users can view replies" on replies for select using (
  not is_private -- Public replies are visible to everyone
  or auth.uid() = user_id -- Visible to the person who wrote the reply
  or auth.uid() = (select user_id from public.needs where id = replies.need_id) -- Visible to the author of the parent need
);

create policy "Users can insert their own replies" on replies for insert with check (auth.uid() = user_id);
create policy "Users can update their own replies" on replies for update using (auth.uid() = user_id);
create policy "Users can delete their own replies" on replies for delete using (auth.uid() = user_id);


-- =================================================================================
-- 4. FOLLOWS TABLE (Social relationships)
-- =================================================================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow others" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow others" on follows for delete using (auth.uid() = follower_id);


-- =================================================================================
-- 4. BOOKMARKS TABLE
-- =================================================================================
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade not null,
  need_id uuid references public.needs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, need_id)
);

alter table public.bookmarks enable row level security;

-- Users can only see and manage their own bookmarks
create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can add bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove bookmarks" on bookmarks for delete using (auth.uid() = user_id);


-- =================================================================================
-- 5. DRAFTS TABLE (Saved, unpublished needs)
-- =================================================================================
create table public.drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  description text,
  category text,
  budget_mode text,
  budget_min numeric,
  budget_max numeric,
  currency text default '$',
  location text,
  flexibility text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drafts enable row level security;

-- Users can only see and manage their own drafts
create policy "Users can view own drafts" on drafts for select using (auth.uid() = user_id);
create policy "Users can insert own drafts" on drafts for insert with check (auth.uid() = user_id);
create policy "Users can update own drafts" on drafts for update using (auth.uid() = user_id);
create policy "Users can delete own drafts" on drafts for delete using (auth.uid() = user_id);


-- =================================================================================
-- 6. MESSAGES & THREADS (Real-time chat)
-- =================================================================================
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Look-up table connecting users to threads
create table public.thread_participants (
  thread_id uuid references public.threads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (thread_id, user_id)
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.threads enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages enable row level security;

-- Threat Participants: Users can only see and act on threads they are part of
create policy "Users view thread participation if involved" on thread_participants 
  for select using (auth.uid() = user_id);

create policy "Users can insert thread_participants" on thread_participants 
  for insert with check (auth.uid() = user_id); -- Note: more complex apps use a stored function to create threads

-- Threads: Viewable if you are a participant
create policy "Users view threads they are in" on threads for select using (
  exists (
    select 1 from public.thread_participants 
    where thread_id = id and user_id = auth.uid()
  )
);

-- Messages: Viewable/Insertable if you are a participant in the thread
create policy "Users view messages in their threads" on messages for select using (
  exists (
    select 1 from public.thread_participants 
    where thread_id = messages.thread_id and user_id = auth.uid()
  )
);

create policy "Users insert messages to their threads" on messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.thread_participants 
    where thread_id = messages.thread_id and user_id = auth.uid()
  )
);


-- =================================================================================
-- 7. NOTIFICATIONS TABLE
-- =================================================================================
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null, -- The receiver
  actor_id uuid references public.profiles(id) on delete cascade not null, -- The person who caused the notification
  type text not null, -- 'follow', 'reply', 'message', etc.
  reference_id uuid, -- Optional ID linking to a need, message, etc.
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- Users can only see and manage their own notifications
create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read/deleted" on notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on notifications for delete using (auth.uid() = user_id);

-- Anyone can trigger a notification (e.g. following someone inserts a notification for them)
create policy "Users can create notifications for others" on notifications for insert with check (auth.uid() = actor_id);


-- =================================================================================
-- 8. REALTIME SUBSCRIPTIONS REQUIRED
-- Enable real-time for tables that drive live UI updates
-- =================================================================================
alter publication supabase_realtime add table public.needs;
alter publication supabase_realtime add table public.replies;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
