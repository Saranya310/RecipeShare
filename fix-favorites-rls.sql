-- Fix RLS policies for recipe_favorites table
-- This script addresses the "Could not find a relationship between 'recipes' and 'profiles'" error

-- 1. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'recipe_favorites';

-- 2. Enable RLS on recipe_favorites table
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON recipe_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON recipe_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON recipe_favorites;

-- 4. Create new RLS policies
CREATE POLICY "Users can view their own favorites" ON recipe_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON recipe_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON recipe_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Test the policies by checking if we can insert a test favorite
-- (This will only work if you're authenticated)
-- INSERT INTO recipe_favorites (recipe_id, user_id) 
-- VALUES ('test-recipe-id', auth.uid());