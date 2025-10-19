-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatar images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152, -- 2MB limit (smaller for profile pictures)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage.objects
-- Allow authenticated users to upload to recipe-images bucket
CREATE POLICY "Allow authenticated uploads to recipe-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-images');

-- Allow authenticated users to upload to avatars bucket  
CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public access to read files from both buckets
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('recipe-images', 'avatars'));

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('recipe-images', 'avatars'));

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('recipe-images', 'avatars'));
