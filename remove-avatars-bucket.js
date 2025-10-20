// Script to remove the avatars storage bucket from Supabase
// Run this with: node remove-avatars-bucket.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need the service role key for this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (add this to your .env.local)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeAvatarsBucket() {
  try {
    console.log('🗑️  Attempting to remove avatars storage bucket...');
    
    // List existing buckets first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📦 Current buckets:', buckets.map(b => b.name));
    
    // Check if avatars bucket exists
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.log('✅ Avatars bucket does not exist - nothing to remove');
      return;
    }
    
    console.log('🗑️  Found avatars bucket, attempting to delete...');
    
    // Delete the bucket
    const { error: deleteError } = await supabase.storage.deleteBucket('avatars');
    
    if (deleteError) {
      console.error('❌ Error deleting avatars bucket:', deleteError);
      console.log('💡 You may need to delete it manually from the Supabase Dashboard > Storage');
    } else {
      console.log('✅ Successfully removed avatars storage bucket');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

removeAvatarsBucket();
