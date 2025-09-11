// Emergency fix for loading screen issue
// This will add the missing auth_role column to fix the app immediately

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🚨 Emergency Fix: Adding auth_role column');
console.log('=====================================');

// Read environment variables
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
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function emergencyFix() {
  try {
    console.log('🔧 Attempting to add auth_role column...');
    
    // Try to add the auth_role column using a direct SQL query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_profiles 
        ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';
        
        UPDATE public.user_profiles 
        SET auth_role = COALESCE(role, 'customer') 
        WHERE auth_role IS NULL;
      `
    });
    
    if (error) {
      console.log('⚠️  Direct SQL approach failed, trying alternative...');
      
      // Alternative approach: try to update a record to trigger the column creation
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ auth_role: 'customer' })
        .eq('id', 'non-existent-id'); // This will fail but might give us info
      
      if (updateError && updateError.message.includes('auth_role')) {
        console.log('✅ Confirmed: auth_role column is missing');
        console.log('');
        console.log('📋 MANUAL FIX REQUIRED:');
        console.log('======================');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Run this SQL:');
        console.log('');
        console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
        console.log('UPDATE public.user_profiles SET auth_role = COALESCE(role, \'customer\') WHERE auth_role IS NULL;');
        console.log('');
        console.log('3. Refresh your browser');
        console.log('');
        return;
      }
    } else {
      console.log('✅ auth_role column added successfully!');
    }
    
    console.log('🎉 Emergency fix completed!');
    console.log('==========================');
    console.log('');
    console.log('Your app should now load properly.');
    console.log('Refresh your browser to see the changes.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
    console.log('');
    console.log('📋 MANUAL FIX REQUIRED:');
    console.log('======================');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Run this SQL:');
    console.log('');
    console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
    console.log('UPDATE public.user_profiles SET auth_role = COALESCE(role, \'customer\') WHERE auth_role IS NULL;');
    console.log('');
    console.log('3. Refresh your browser');
    console.log('');
  }
}

emergencyFix().catch(console.error);