-- Update the handle_new_user trigger to assign a temporary unique username upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  temp_username text;
BEGIN
  -- Generate a temporary username: user_ + the first 8 characters of their UUID (stripped of hyphens)
  temp_username := 'user_' || lower(substring(replace(new.id::text, '-', ''), 1, 8));
  
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id, 
    split_part(new.email, '@', 1), -- Default display name from email
    temp_username                  -- Temporary username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger runs AFTER a user is created in auth.users. 
-- Make sure the profiles table has the 'username' column and a unique constraint.
