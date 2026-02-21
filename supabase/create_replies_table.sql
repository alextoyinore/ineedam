-- Run this in your Supabase SQL Editor to add support for public Thread Replies.

create table if not exists public.replies (
  id uuid default gen_random_uuid() primary key,
  need_id uuid references public.needs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS permissions
alter table public.replies enable row level security;

create policy "Anyone can view replies" on replies for select using (true);
create policy "Users can insert their own replies" on replies for insert with check (auth.uid() = user_id);
create policy "Users can update their own replies" on replies for update using (auth.uid() = user_id);
create policy "Users can delete their own replies" on replies for delete using (auth.uid() = user_id);

-- Enable real-time updates for threads
alter publication supabase_realtime add table public.replies;
