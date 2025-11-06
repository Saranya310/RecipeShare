-- Create storage bucket for recipe images
-- Run this in your Supabase SQL Editor after setting up the database schema

-- Create recipe-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage.objects
-- Allow authenticated users to upload to recipe-images bucket
CREATE POLICY "Allow authenticated uploads to recipe-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-images');

-- Allow public access to read files from recipe-images bucket
CREATE POLICY "Allow public read access to recipe-images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'recipe-images');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files in recipe-images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'recipe-images');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files from recipe-images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'recipe-images');

