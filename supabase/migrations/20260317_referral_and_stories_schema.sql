-- =================================================================================
-- REFERRAL AND NEED STORIES MIGRATION
-- =================================================================================

-- 1. Update Profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS earned_endorsements INTEGER DEFAULT 0;

-- 2. Create Need Stories table
CREATE TABLE IF NOT EXISTS public.need_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  poster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  responder_count INTEGER DEFAULT 0,
  outcome TEXT,
  fulfilled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS for Need Stories
ALTER TABLE public.need_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view need stories" ON public.need_stories FOR SELECT USING (true);
CREATE POLICY "System can insert need stories" ON public.need_stories FOR INSERT WITH CHECK (true); -- Usually handled by service role or specific logic

-- 4. Referral Point to Endorsement Trigger
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS trigger AS $$
BEGIN
  -- If referral_points reached a multiple of 5, increment earned_endorsements
  IF (NEW.referral_points / 5) > (OLD.referral_points / 5) THEN
    NEW.earned_endorsements := OLD.earned_endorsements + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_referral_points_update ON public.profiles;
CREATE TRIGGER on_referral_points_update
BEFORE UPDATE OF referral_points ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_points >= 5)
EXECUTE FUNCTION public.handle_referral_conversion();

-- 5. Helper Function to increment referral points by username
CREATE OR REPLACE FUNCTION public.increment_referral_points(referrer_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET referral_points = referral_points + 1
  WHERE username = referrer_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
