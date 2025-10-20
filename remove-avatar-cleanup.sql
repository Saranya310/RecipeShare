-- Remove avatar_url column from profiles table
-- This script removes the unused avatar_url column since we're no longer using avatar uploads

-- Step 1: Remove the avatar_url column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;

-- Step 2: Drop the avatars storage bucket (if it exists)
-- Note: This needs to be done manually in Supabase Dashboard > Storage
-- or via the Supabase CLI if you have it configured

-- Step 3: Verify the profiles table structure
-- You can run this to check the current structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;
