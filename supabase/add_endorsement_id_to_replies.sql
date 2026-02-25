-- Add endorsement_id to replies table to isolate endorsement threads
ALTER TABLE public.replies 
ADD COLUMN IF NOT EXISTS endorsement_id UUID REFERENCES public.endorsements(id) ON DELETE CASCADE;

-- Update RLS policy to include endorsement owners in private view access
DROP POLICY IF EXISTS "Users can view replies" ON public.replies;
CREATE POLICY "Users can view replies" ON public.replies FOR SELECT USING (
  NOT is_private -- Public replies are visible to everyone
  OR auth.uid() = user_id -- Visible to the person who wrote the reply
  OR (
    need_id IS NOT NULL AND 
    auth.uid() = (SELECT user_id FROM public.needs WHERE id = public.replies.need_id)
  ) -- Visible to the author of the parent need
  OR (
    endorsement_id IS NOT NULL AND 
    auth.uid() = (SELECT endorser_id FROM public.endorsements WHERE id = public.replies.endorsement_id)
  ) -- Visible to the author of the endorsement
);

-- Index for filtering by endorsement_id
CREATE INDEX IF NOT EXISTS idx_replies_endorsement_id ON public.replies(endorsement_id);
