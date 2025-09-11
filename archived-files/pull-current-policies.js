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

async function pullCurrentPolicies() {
  console.log('\n=== Connecting to Supabase ===\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Present' : 'Missing');
  
  try {
    // Test connection by checking buckets
    console.log('\n=== Testing Connection ===\n');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Connection failed:', bucketError);
      return;
    }
    
    console.log('✅ Connected successfully!');
    console.log('\n=== Available Storage Buckets ===\n');
    buckets.forEach(bucket => {
      console.log(`- ${bucket.id} (public: ${bucket.public})`);
    });
    
    const documentsBucket = buckets.find(b => b.id === 'documents');
    if (documentsBucket) {
      console.log('\n✅ Documents bucket exists');
      console.log('Bucket details:', JSON.stringify(documentsBucket, null, 2));
    } else {
      console.log('\n❌ Documents bucket NOT found');
    }
    
    // Try to query RLS policies using raw SQL
    console.log('\n=== Querying RLS Policies ===\n');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('get_storage_policies');
    
    if (policyError) {
      console.log('Note: Could not query policies via RPC (expected if function doesn\'t exist)');
      console.log('Error:', policyError.message);
    } else {
      console.log('Storage policies:', policies);
    }
    
    // Try a direct query approach
    console.log('\n=== Attempting Direct Policy Query ===\n');
    
    const { data: directPolicies, error: directError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'storage')
      .in('tablename', ['objects', 'buckets']);
    
    if (directError) {
      console.log('Note: Could not query pg_policies directly (expected with limited permissions)');
      console.log('Error:', directError.message);
    } else {
      console.log('\n✅ Found policies:');
      directPolicies.forEach(policy => {
        console.log(`\nTable: ${policy.tablename}`);
        console.log(`Policy: ${policy.policyname}`);
        console.log(`Command: ${policy.cmd}`);
        console.log(`Roles: ${policy.roles}`);
        console.log(`Qual: ${policy.qual}`);
        console.log(`With Check: ${policy.with_check}`);
        console.log('---');
      });
    }
    
    // Test upload to see what happens
    console.log('\n=== Testing Upload Permissions ===\n');
    
    const testFileName = `test-policy-check-${Date.now()}.txt`;
    const testFilePath = `id-proofs/${testFileName}`;
    const testFileContent = 'Policy test file';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testFilePath, new Blob([testFileContent], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('Status:', uploadError.statusCode);
      console.error('Full error:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData.path);
      
      // Clean up
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([testFilePath]);
      
      if (!deleteError) {
        console.log('✅ Test file cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

pullCurrentPolicies();