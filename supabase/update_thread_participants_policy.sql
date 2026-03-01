-- Allow users to update their own last_read_at timestamp in thread_participants
-- This is required for the "mark as read" functionality to persist in the database

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'thread_participants' 
        AND policyname = 'Users can update their own last_read_at'
    ) THEN
        CREATE POLICY "Users can update their own last_read_at" ON public.thread_participants
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END
$$;
