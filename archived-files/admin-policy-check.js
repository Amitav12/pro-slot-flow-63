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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  console.log('\nNote: You need the service role key to manage policies and buckets.');
  console.log('Check your .env file for SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function adminPolicyCheck() {
  console.log('\n=== Connecting to Supabase with Service Role ===\n');
  console.log('URL:', supabaseUrl);
  console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
  
  try {
    // Check buckets
    console.log('\n=== Checking Storage Buckets ===\n');
    const { data: buckets, error: bucketError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Failed to list buckets:', bucketError);
      return;
    }
    
    console.log('✅ Connected successfully!');
    console.log('Available buckets:');
    buckets.forEach(bucket => {
      console.log(`- ${bucket.id} (public: ${bucket.public})`);
    });
    
    const documentsBucket = buckets.find(b => b.id === 'documents');
    if (!documentsBucket) {
      console.log('\n❌ Documents bucket NOT found');
      console.log('\n=== Creating Documents Bucket ===\n');
      
      const { data: newBucket, error: createError } = await supabaseAdmin
        .storage
        .createBucket('documents', {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        });
      
      if (createError) {
        console.error('❌ Failed to create documents bucket:', createError);
      } else {
        console.log('✅ Documents bucket created successfully:', newBucket);
      }
    } else {
      console.log('\n✅ Documents bucket exists');
      console.log('Bucket details:', JSON.stringify(documentsBucket, null, 2));
    }
    
    // Query RLS policies using SQL
    console.log('\n=== Querying Current RLS Policies ===\n');
    
    const { data: policies, error: policyError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'storage')
      .in('tablename', ['objects', 'buckets']);
    
    if (policyError) {
      console.log('Trying alternative query method...');
      
      // Try raw SQL query
      const { data: sqlPolicies, error: sqlError } = await supabaseAdmin
        .rpc('exec_sql', {
          query: `
            SELECT 
              schemaname,
              tablename,
              policyname,
              permissive,
              roles,
              cmd,
              qual,
              with_check
            FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename IN ('objects', 'buckets')
            ORDER BY tablename, policyname;
          `
        });
      
      if (sqlError) {
        console.log('❌ Could not query policies:', sqlError.message);
        
        // Try a simpler approach - just check if RLS is enabled
        const { data: rlsStatus, error: rlsError } = await supabaseAdmin
          .rpc('exec_sql', {
            query: `
              SELECT 
                schemaname,
                tablename,
                rowsecurity
              FROM pg_tables 
              WHERE schemaname = 'storage' 
              AND tablename IN ('objects', 'buckets');
            `
          });
        
        if (!rlsError && rlsStatus) {
          console.log('\n=== RLS Status ===\n');
          rlsStatus.forEach(table => {
            console.log(`${table.schemaname}.${table.tablename}: RLS ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
          });
        }
      } else {
        console.log('\n✅ Found policies:');
        sqlPolicies.forEach(policy => {
          console.log(`\nTable: storage.${policy.tablename}`);
          console.log(`Policy: ${policy.policyname}`);
          console.log(`Command: ${policy.cmd}`);
          console.log(`Roles: ${policy.roles}`);
          console.log(`Qual: ${policy.qual || 'NULL'}`);
          console.log(`With Check: ${policy.with_check || 'NULL'}`);
          console.log('---');
        });
      }
    } else {
      console.log('\n✅ Found policies via direct query:');
      policies.forEach(policy => {
        console.log(`\nTable: storage.${policy.tablename}`);
        console.log(`Policy: ${policy.policyname}`);
        console.log(`Command: ${policy.cmd}`);
        console.log(`Roles: ${policy.roles}`);
        console.log(`Qual: ${policy.qual || 'NULL'}`);
        console.log(`With Check: ${policy.with_check || 'NULL'}`);
        console.log('---');
      });
    }
    
    // Test upload with admin privileges
    console.log('\n=== Testing Admin Upload ===\n');
    
    const testFileName = `admin-test-${Date.now()}.txt`;
    const testFilePath = `id-proofs/${testFileName}`;
    const testFileContent = 'Admin policy test file';
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(testFilePath, new Blob([testFileContent], { type: 'text/plain' }));
    
    if (uploadError) {
      console.error('❌ Admin upload test failed:', uploadError.message);
      console.error('Status:', uploadError.statusCode);
      console.error('Full error:', uploadError);
    } else {
      console.log('✅ Admin upload test successful:', uploadData.path);
      
      // Clean up
      const { error: deleteError } = await supabaseAdmin.storage
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

adminPolicyCheck();