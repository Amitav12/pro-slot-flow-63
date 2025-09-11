import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env file
function loadEnvVars() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return {};
  }
}

const envVars = loadEnvVars();
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentState() {
  console.log('\n=== Current Supabase State Analysis ===\n');
  console.log('URL:', supabaseUrl);
  console.log('Using: Public/Anon Key (Limited Permissions)');
  
  try {
    // Check buckets
    console.log('\n=== Storage Buckets ===\n');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Failed to list buckets:', bucketError.message);
    } else {
      console.log('Available buckets:');
      if (buckets.length === 0) {
        console.log('  No buckets found');
      } else {
        buckets.forEach(bucket => {
          console.log(`  - ${bucket.id} (public: ${bucket.public})`);
        });
      }
      
      const documentsBucket = buckets.find(b => b.id === 'documents');
      if (documentsBucket) {
        console.log('\n✅ Documents bucket exists');
      } else {
        console.log('\n❌ Documents bucket NOT found');
      }
    }
    
    // Test authentication
    console.log('\n=== Authentication Test ===\n');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ No authenticated user (expected with anon key)');
    } else if (user) {
      console.log('✅ Authenticated user found:', user.email);
    } else {
      console.log('❌ No user session');
    }
    
    // Test upload (will likely fail due to RLS)
    console.log('\n=== Upload Test (Expected to Fail) ===\n');
    
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = `id-proofs/${testFileName}`;
    const testFileContent = 'Test file content';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testFilePath, new Blob([testFileContent], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error('❌ Upload failed (expected):', uploadError.message);
      console.error('   Status:', uploadError.statusCode);
      
      if (uploadError.message.includes('row-level security policy')) {
        console.log('\n🔍 Analysis: RLS policies are blocking the upload');
        console.log('   This confirms that RLS is enabled but policies are restrictive');
      }
      
      if (uploadError.message.includes('Bucket not found')) {
        console.log('\n🔍 Analysis: Documents bucket does not exist');
      }
    } else {
      console.log('✅ Upload successful (unexpected):', uploadData.path);
    }
    
    console.log('\n=== Summary ===\n');
    console.log('Current Issues:');
    
    if (!buckets || !buckets.find(b => b.id === 'documents')) {
      console.log('  1. ❌ Documents bucket is missing');
    } else {
      console.log('  1. ✅ Documents bucket exists');
    }
    
    if (uploadError && uploadError.message.includes('row-level security policy')) {
      console.log('  2. ❌ RLS policies are blocking uploads');
    } else if (uploadError) {
      console.log('  2. ❌ Upload failed for other reasons');
    } else {
      console.log('  2. ✅ Upload permissions working');
    }
    
    console.log('\n=== Next Steps ===\n');
    console.log('To fix these issues, you need to:');
    console.log('\n1. Get your Supabase Service Role Key:');
    console.log('   - Go to your Supabase project dashboard');
    console.log('   - Navigate to Settings > API');
    console.log('   - Copy the "service_role" key (NOT the anon/public key)');
    console.log('   - Add it to your .env file as: SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
    console.log('\n2. Run the comprehensive storage fix:');
    console.log('   - Execute the comprehensive-storage-fix.sql in Supabase SQL Editor');
    console.log('   - This will create the bucket and set up proper RLS policies');
    console.log('\n3. Alternative: Manual setup in Supabase Dashboard:');
    console.log('   - Go to Storage in your Supabase dashboard');
    console.log('   - Create a "documents" bucket (private)');
    console.log('   - Set up RLS policies for authenticated users');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkCurrentState();