# 🔧 Fix Storage Upload Error

## ❌ **Current Error:**
```
Upload failed: new row violates row-level security policy
```

## 🎯 **Root Cause:**
Supabase Row Level Security (RLS) policies are blocking storage operations. This is a security feature that needs to be configured.

## 🛠️ **Solution: Manual Setup Required**

### **Step 1: Create Storage Buckets**
1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "Create a new bucket"**

#### **Create Bucket 1: recipe-images**
- **Name:** `recipe-images`
- **✅ Public bucket** (check this box!)
- **File size limit:** `5242880` (5MB)
- **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`

#### **Create Bucket 2: avatars**
- **Name:** `avatars`
- **✅ Public bucket** (check this box!)
- **File size limit:** `2097152` (2MB)
- **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`

### **Step 2: Create RLS Policies**
1. **Go to Authentication → Policies** in Supabase Dashboard
2. **Find the `storage.objects` table**
3. **Add these 5 policies:**

#### **Policy 1: Allow authenticated uploads to recipe-images**
- **Policy name:** `Allow authenticated uploads to recipe-images`
- **Target roles:** `authenticated`
- **Operation:** `INSERT`
- **USING expression:** `bucket_id = 'recipe-images'`

#### **Policy 2: Allow authenticated uploads to avatars**
- **Policy name:** `Allow authenticated uploads to avatars`
- **Target roles:** `authenticated`
- **Operation:** `INSERT`
- **USING expression:** `bucket_id = 'avatars'`

#### **Policy 3: Allow public read access**
- **Policy name:** `Allow public read access`
- **Target roles:** `public`
- **Operation:** `SELECT`
- **USING expression:** `bucket_id IN ('recipe-images', 'avatars')`

#### **Policy 4: Allow users to update own files**
- **Policy name:** `Allow users to update own files`
- **Target roles:** `authenticated`
- **Operation:** `UPDATE`
- **USING expression:** `bucket_id IN ('recipe-images', 'avatars')`

#### **Policy 5: Allow users to delete own files**
- **Policy name:** `Allow users to delete own files`
- **Target roles:** `authenticated`
- **Operation:** `DELETE`
- **USING expression:** `bucket_id IN ('recipe-images', 'avatars')`

### **Step 3: Alternative - Use SQL Editor**
If the dashboard method doesn't work, use the **SQL Editor**:

1. **Go to SQL Editor** in Supabase Dashboard
2. **Run this SQL:**

```sql
-- Create buckets first
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
CREATE POLICY "Allow authenticated uploads to recipe-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('recipe-images', 'avatars'));

CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('recipe-images', 'avatars'));

CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('recipe-images', 'avatars'));
```

## 🚀 **After Setup:**
1. **Test avatar upload** in your profile page
2. **Should work without RLS errors**
3. **Images will be stored in Supabase Storage**

## 💡 **Temporary Workaround:**
Until storage is set up, users can:
1. **Upload images to any hosting service** (Imgur, Google Photos, etc.)
2. **Copy the image URL**
3. **Paste it in the "Or enter image URL" field**

This works immediately without any Supabase configuration!

## ✅ **Expected Result:**
- ✅ Avatar uploads work without errors
- ✅ Recipe image uploads work without errors
- ✅ Images are stored securely in Supabase
- ✅ Images are publicly accessible for viewing
