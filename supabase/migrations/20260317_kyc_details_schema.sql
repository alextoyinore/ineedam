-- =================================================================================
-- KYC DETAILED DATA SCHEMA
-- =================================================================================

-- 1. Create KYC Details Table
CREATE TABLE IF NOT EXISTS public.kyc_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_legal_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    residential_address TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    id_front_url TEXT NOT NULL,
    id_back_url TEXT,
    selfie_url TEXT NOT NULL,
    utility_bill_url TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rejection_reason TEXT,
    
    UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can view their own KYC details
CREATE POLICY "Users can view own kyc details" 
ON public.kyc_details FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own KYC details
CREATE POLICY "Users can insert own kyc details" 
ON public.kyc_details FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own KYC details (if pending or none)
CREATE POLICY "Users can update own kyc details" 
ON public.kyc_details FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Storage Bucket for KYC Documents (Note: This is usually done via API or Console, but adding as comment)
-- The bucket should be named 'kyc_documents' and be PRIVATE.
