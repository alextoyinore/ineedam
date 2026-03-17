-- =================================================================================
-- KYC VERIFICATION SCHEMA
-- =================================================================================

-- 1. Create KYC Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');
    END IF;
END $$;

-- 2. Add KYC columns to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
