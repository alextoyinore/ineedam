-- Migration: Add push_subscription column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- Update the storage policy if needed (assuming profiles are already managed)
-- No additional RLS needed if it's already secured by user_id
