-- Migration: Add referenced_need_id to messages table
-- This allows a chat message to reference/share a need post as a rich card
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS referenced_need_id uuid REFERENCES needs(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_referenced_need_id ON messages(referenced_need_id) WHERE referenced_need_id IS NOT NULL;
