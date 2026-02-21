-- Run this in your Supabase SQL Editor to fix the foreign key constraint error.
-- This will backfill the "profiles" table for any users who signed up BEFORE
-- we created the trigger in the previous script.

insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1) 
from auth.users
where id not in (select id from public.profiles);
