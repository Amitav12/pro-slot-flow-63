import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function createDocumentsBucket() {
  try {
    // Read environment variables from .env file
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        // Remove quotes from values
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });

    // Initialize Supabase client
    const supabase = createClient(
      envVars.VITE_SUPABASE_URL,
      envVars.VITE_SUPABASE_PUBLISHABLE_KEY
    );

    console.log('🔗 Supabase URL:', envVars.VITE_SUPABASE_URL);
    console.log('🔑 Using key:', envVars.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Found' : 'Missing');

    console.log('🔧 Creating documents storage bucket...');

    // Try to create the bucket using the storage API
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('documents', {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Documents bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        throw bucketError;
      }
    } else {
      console.log('✅ Documents bucket created successfully:', bucketData);
    }

    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      const documentsBucket = buckets.find(b => b.id === 'documents');
      if (documentsBucket) {
        console.log('✅ Documents bucket verified:', documentsBucket);
      } else {
        console.log('⚠️ Documents bucket not found in list');
      }
    }

    console.log('\n📋 Next steps:');
    console.log('1. If bucket creation failed, run the SQL in create-documents-bucket.sql in Supabase Dashboard');
    console.log('2. Test the Service Provider signup with ID proof upload');
    console.log('3. Check that files are uploaded to the documents/id-proofs/ folder');

  } catch (error) {
    console.error('❌ Script failed:', error);
    console.log('\n🔧 Manual fix required:');
    console.log('1. Go to Supabase Dashboard > Storage');
    console.log('2. Create a new bucket named "documents"');
    console.log('3. Set it as public');
    console.log('4. Or run the SQL in create-documents-bucket.sql in SQL Editor');
  }
}

createDocumentsBucket();