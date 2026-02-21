-- Run this script to update your existing replies setup for private threading

-- 1. Add the new boolean column (defaults to false so existing replies stay public)
alter table public.replies add column if not exists is_private boolean default false not null;

-- 2. Drop the old overly-permissive select policy
drop policy if exists "Anyone can view replies" on public.replies;

-- 3. Create the new policy that respects the `is_private` flag
create policy "Users can view replies" on public.replies for select using (
  not is_private -- Public replies are visible to everyone
  or auth.uid() = user_id -- Visible to the person who wrote the reply
  or auth.uid() = (select user_id from public.needs where id = public.replies.need_id) -- Visible to the author of the parent need
);
