-- =================================================================================
-- ENDORSEMENTS TABLE
-- Need owners (whose need is marked met) can publicly endorse the person who helped.
-- Run this in your Supabase SQL Editor.
-- =================================================================================

-- 1. Create the endorsements table
CREATE TABLE IF NOT EXISTS public.endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- The person giving the endorsement (the need owner)
  endorser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- The person being endorsed (the helper, formerly met_by_id)
  endorsed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- The need this endorsement is tied to (must be status = 'met')
  need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- The public appreciation message
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Anyone can view endorsements" ON public.endorsements;
CREATE POLICY "Anyone can view endorsements" ON public.endorsements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Need owners can create endorsements" ON public.endorsements;
CREATE POLICY "Need owners can create endorsements" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

DROP POLICY IF EXISTS "Endorsers can delete their own endorsements" ON public.endorsements;
CREATE POLICY "Endorsers can delete their own endorsements" ON public.endorsements
  FOR DELETE USING (auth.uid() = endorser_id);

-- 4. Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_endorsement_notification()
RETURNS trigger AS $$
DECLARE
  endorser_name TEXT;
BEGIN
  SELECT display_name INTO endorser_name FROM public.profiles WHERE id = NEW.endorser_id;

  INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
  VALUES (
    NEW.endorsed_id,
    NEW.endorser_id,
    'endorsement',
    NEW.need_id,
    'endorsed you: ' || left(NEW.message, 60)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_endorsement_notification ON public.endorsements;
CREATE TRIGGER on_endorsement_notification
AFTER INSERT ON public.endorsements
FOR EACH ROW EXECUTE FUNCTION public.handle_endorsement_notification();

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.endorsements;

-- 6. Performance indexes
CREATE INDEX IF NOT EXISTS endorsements_endorsed_id_idx ON public.endorsements(endorsed_id);
CREATE INDEX IF NOT EXISTS endorsements_endorser_id_idx ON public.endorsements(endorser_id);
CREATE UNIQUE INDEX IF NOT EXISTS endorsements_need_id_unique ON public.endorsements(need_id);
