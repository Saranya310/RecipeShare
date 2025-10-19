# Supabase Storage Setup Guide

## Option 1: Use Supabase Dashboard (Recommended)

### Step 1: Create Storage Buckets
You need to create **TWO** storage buckets:

#### Bucket 1: Recipe Images
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Fill in the details:
   - **Name**: `recipe-images`
   - **Public bucket**: ✅ **Check this box** (important!)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
5. Click **"Create bucket"**

#### Bucket 2: Avatar Images
1. Click **"New bucket"** again
2. Fill in the details:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Check this box** (important!)
   - **File size limit**: `2 MB` (smaller for profile pictures)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
3. Click **"Create bucket"**

### Step 2: Set Up RLS Policies (Required for Uploads)

#### Option A: Use SQL Editor (Recommended)
Run this SQL in your Supabase SQL Editor:

```sql
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
```

#### Option B: Use Dashboard (If SQL doesn't work)
1. Go to **Authentication** → **Policies**
2. Find the `storage.objects` table
3. Add these policies:

**Policy 1: Allow authenticated uploads to recipe-images**
- **Policy name**: `Allow authenticated uploads to recipe-images`
- **Target roles**: `authenticated`
- **Operation**: `INSERT`
- **USING expression**: `bucket_id = 'recipe-images'`

**Policy 2: Allow authenticated uploads to avatars**
- **Policy name**: `Allow authenticated uploads to avatars`
- **Target roles**: `authenticated`
- **Operation**: `INSERT`
- **USING expression**: `bucket_id = 'avatars'`

**Policy 3: Allow public read access**
- **Policy name**: `Allow public read access`
- **Target roles**: `public`
- **Operation**: `SELECT`
- **USING expression**: `bucket_id IN ('recipe-images', 'avatars')`

**Policy 4: Allow users to update own files**
- **Policy name**: `Allow users to update own files`
- **Target roles**: `authenticated`
- **Operation**: `UPDATE`
- **USING expression**: `bucket_id IN ('recipe-images', 'avatars')`

**Policy 5: Allow users to delete own files**
- **Policy name**: `Allow users to delete own files`
- **Target roles**: `authenticated`
- **Operation**: `DELETE`
- **USING expression**: `bucket_id IN ('recipe-images', 'avatars')`

## Option 2: Use the Simplified SQL (If you have permissions)

Run this simplified SQL in the SQL Editor:

```sql
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
```

## Option 3: Use URL Input (Works Immediately)

If you can't set up storage, users can still upload images by:
1. Uploading images to any image hosting service (Imgur, Google Photos, etc.)
2. Copying the image URL
3. Pasting it in the "Or enter image URL" field in the profile page

## Testing the Setup

After setting up the bucket:
1. Go to your profile page
2. Try uploading an image
3. If it works, you'll see the image preview
4. If it doesn't work, use the URL input as a fallback

## Troubleshooting

### If you get "Bucket not found" error:
- Make sure the bucket name is exactly `recipe-images`
- Check that the bucket is marked as **public**
- Verify the bucket was created successfully

### If you get "Permission denied" error:
- The RLS policies might not be set up correctly
- Use the URL input as a workaround
- Contact Supabase support if needed

### If uploads work but images don't display:
- Check that the bucket is public
- Verify the file was uploaded successfully in the Storage section
- Check the browser console for any CORS errors
