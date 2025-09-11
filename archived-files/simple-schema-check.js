import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🔍 Simple Database Schema Check');
console.log('===============================');

// Read environment variables from .env file
let supabaseUrl, supabaseKey;
try {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim().replace(/"/g, '');
    }
    if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim().replace(/"/g, '');
    }
  }
} catch (error) {
  console.log('❌ Could not read .env file');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserProfilesTable() {
  console.log('🔍 Checking user_profiles table...');
  
  try {
    // Try to select from user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing user_profiles:', error.message);
      
      if (error.message.includes('relation "user_profiles" does not exist')) {
        console.log('');
        console.log('🎯 ISSUE FOUND: user_profiles table does not exist');
        console.log('=====================================');
        console.log('');
        console.log('📋 SOLUTION:');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Run the 4-persona-auth-system.sql file');
        console.log('3. This will create the user_profiles table and all necessary triggers');
        console.log('');
        return;
      }
      
      if (error.message.includes('auth_role')) {
        console.log('');
        console.log('🎯 ISSUE FOUND: auth_role column is missing');
        console.log('==========================================');
        console.log('');
        console.log('📋 SOLUTION - Run this SQL:');
        console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
        console.log('UPDATE public.user_profiles SET auth_role = role WHERE auth_role IS NULL;');
        console.log('');
        return;
      }
      
      return;
    }

    console.log('✅ user_profiles table exists and is accessible');
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Current columns:', columns.join(', '));
      
      // Check for required columns
      const requiredColumns = ['auth_role', 'role', 'user_id', 'full_name'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('');
        console.log('🎯 ISSUE FOUND: Missing required columns');
        console.log('======================================');
        console.log('Missing:', missingColumns.join(', '));
        console.log('');
        console.log('📋 SOLUTION - Run this SQL:');
        missingColumns.forEach(col => {
          if (col === 'auth_role') {
            console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
          } else if (col === 'role') {
            console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT \'customer\';');
          } else {
            console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
          }
        });
        console.log('');
        return;
      }
      
      console.log('✅ All required columns are present');
    } else {
      console.log('📋 Table exists but is empty');
    }
    
    // Test insert operation
    console.log('🧪 Testing profile creation...');
    
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        full_name: 'Test User',
        role: 'customer',
        auth_role: 'customer'
      });

    if (insertError) {
      console.log('❌ Profile creation test failed:', insertError.message);
      
      if (insertError.message.includes('auth_role')) {
        console.log('');
        console.log('🎯 ISSUE FOUND: auth_role column issue');
        console.log('===================================');
        console.log('📋 SOLUTION - Run this SQL:');
        console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
        console.log('');
      } else if (insertError.message.includes('RLS')) {
        console.log('');
        console.log('🎯 ISSUE FOUND: RLS policy issue');
        console.log('===============================');
        console.log('📋 SOLUTION - Run this SQL:');
        console.log('ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;');
        console.log('CREATE POLICY "Enable insert for service role" ON public.user_profiles FOR INSERT WITH CHECK (true);');
        console.log('');
      }
    } else {
      console.log('✅ Profile creation test successful');
      
      // Clean up test record
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', testUserId);
    }
    
    console.log('');
    console.log('🎉 Database Check Complete!');
    console.log('===========================');
    console.log('');
    console.log('If you saw any issues above, run the provided SQL fixes.');
    console.log('Otherwise, your database should be ready for authentication.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkUserProfilesTable().catch(console.error);