-- =================================================================================
-- need_interests table: soft "Interested in helping" signal on a Need
-- Run in Supabase SQL Editor
-- =================================================================================

create table if not exists public.need_interests (
  user_id uuid references public.profiles(id) on delete cascade not null,
  need_id uuid references public.needs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, need_id)
);

alter table public.need_interests enable row level security;

create policy "Anyone can view interest signals" on need_interests for select using (true);
create policy "Users can express interest" on need_interests for insert with check (auth.uid() = user_id);
create policy "Users can remove their interest" on need_interests for delete using (auth.uid() = user_id);

-- Enable realtime so interested count updates live
alter publication supabase_realtime add table public.need_interests;
