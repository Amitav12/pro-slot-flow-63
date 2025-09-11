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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStoragePolicies() {
  console.log('\n=== Checking Storage RLS Policies ===\n');
  
  try {
    // Check if documents bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('Error fetching buckets:', bucketError);
    } else {
      console.log('Available buckets:');
      buckets.forEach(bucket => {
        console.log(`- ${bucket.id} (public: ${bucket.public})`);
      });
      
      const documentsBucket = buckets.find(b => b.id === 'documents');
      if (documentsBucket) {
        console.log('✅ Documents bucket exists');
      } else {
        console.log('❌ Documents bucket NOT found');
      }
    }
    
    // Try to test upload permissions
    console.log('\n=== Testing Upload Permissions ===\n');
    
    // Create a test file
    const testFileName = `test-upload-${Date.now()}.txt`;
    const testFilePath = `id-proofs/${testFileName}`;
    const testFileContent = 'This is a test file for checking RLS policies';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testFilePath, new Blob([testFileContent], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('Error details:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData.path);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([testFilePath]);
      
      if (deleteError) {
        console.log('Note: Could not clean up test file:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStoragePolicies();