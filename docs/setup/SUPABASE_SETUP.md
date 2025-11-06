# Supabase Setup Guide

## 1. Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of [`sql/supabase-schema.sql`](./sql/supabase-schema.sql) into the SQL editor
4. Click "Run" to execute the schema

This will create all necessary tables, RLS policies, triggers, and default categories.

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to your Supabase project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API"
4. Copy the "Project URL" and "anon public" key

## 3. Authentication Setup

Make sure you have:
- ✅ Email authentication enabled
- ✅ Email confirmation disabled (for development)
- ✅ User registration enabled

## 4. Database Tables Created

The schema creates the following tables:

### Core Tables:
- **categories** - Recipe categories (Appetizers, Main Course, etc.)
- **recipes** - Main recipes table with ingredients, instructions, etc.
- **profiles** - User profiles (extends auth.users)
- **recipe_ratings** - User ratings and reviews for recipes
- **recipe_favorites** - User's favorite recipes

### Features Included:
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on signup
- ✅ Updated timestamps
- ✅ Proper foreign key relationships
- ✅ Default categories with emojis
- ✅ Indexes for performance

## 5. Storage Setup (Optional)

If you want to use SQL to set up storage buckets instead of the dashboard:

1. Go to SQL Editor
2. Copy and paste the contents of [`sql/setup-storage.sql`](./sql/setup-storage.sql)
3. Click "Run" to create the `recipe-images` bucket and RLS policies

**Alternative:** You can also create the bucket manually:
- Go to Storage → Create bucket → Name: `recipe-images` → Set as public

## 6. Next Steps

After setting up the database:
1. Update your `.env.local` with your Supabase credentials
2. Set up storage bucket (via SQL or dashboard)
3. Test the connection by running `npm run dev`
4. The authentication and database integration will be ready to use!
