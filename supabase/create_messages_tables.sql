-- Run this script to create the necessary tables for Direct Messages

-- 1. Create the Threads table
create table public.message_threads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the Thread Participants table (junction table)
create table public.thread_participants (
  thread_id uuid references public.message_threads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (thread_id, user_id)
);

-- 3. Create the Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.message_threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.message_threads enable row level security;
alter table public.thread_participants enable row level security;
alter table public.messages enable row level security;

-- 5. RLS Policies
-- Users can only see threads they are a participant in
create policy "Users can view their threads" on public.message_threads for select using (
  exists (
    select 1 from public.thread_participants
    where thread_id = message_threads.id and user_id = auth.uid()
  )
);

-- Users can only view participants of their own threads
create policy "Users can view participants of their threads" on public.thread_participants for select using (
  exists (
    select 1 from public.thread_participants tp
    where tp.thread_id = thread_participants.thread_id and tp.user_id = auth.uid()
  )
);

-- Users can only see messages in their threads
create policy "Users can view messages in their threads" on public.messages for select using (
  exists (
    select 1 from public.thread_participants
    where thread_id = messages.thread_id and user_id = auth.uid()
  )
);

-- Users can insert messages if they are part of the thread AND they are the sender
create policy "Users can insert messages in their threads" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.thread_participants
    where thread_id = messages.thread_id and user_id = auth.uid()
  )
);

-- Trigger to update message_threads.updated_at whenever a new message is inserted
create or replace function public.update_thread_timestamp()
returns trigger as $$
begin
  update public.message_threads
  set updated_at = now()
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

create trigger update_thread_timestamp_trigger
after insert on public.messages
for each row execute function public.update_thread_timestamp();

-- Turn on realtime for messages so UI updates instantly
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.thread_participants;
alter publication supabase_realtime add table public.message_threads;
