import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Current Database Schema');
  console.log('==================================');
  
  try {
    // Check if user_profiles table exists and get its structure
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "user_profiles" does not exist')) {
        console.log('❌ user_profiles table does not exist');
        console.log('');
        console.log('📋 SOLUTION: Run the complete database setup');
        console.log('============================================');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Run the 4-persona-auth-system.sql file');
        console.log('');
        return;
      }
      throw error;
    }
    
    console.log('✅ user_profiles table exists');
    
    // Get table structure by trying to select all columns
    const { data: sampleData, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Error reading table structure:', selectError.message);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('');
      console.log('📋 Current Table Columns:');
      console.log('=========================');
      Object.keys(sampleData[0]).forEach(column => {
        console.log(`✓ ${column}`);
      });
    } else {
      console.log('');
      console.log('📋 Table exists but is empty');
      console.log('============================');
      
      // Try to get column info from information_schema
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'user_profiles' });
      
      if (!columnsError && columns) {
        console.log('Columns from schema:');
        columns.forEach(col => console.log(`✓ ${col.column_name} (${col.data_type})`));
      }
    }
    
    // Check specifically for auth_role column
    console.log('');
    console.log('🔍 Checking for auth_role column...');
    
    const { data: authRoleTest, error: authRoleError } = await supabase
      .from('user_profiles')
      .select('auth_role')
      .limit(1);
    
    if (authRoleError) {
      if (authRoleError.message.includes('column "auth_role" does not exist')) {
        console.log('❌ auth_role column is missing');
        console.log('');
        console.log('📋 SOLUTION: Add missing column');
        console.log('==============================');
        console.log('Run this SQL in Supabase Dashboard:');
        console.log('');
        console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
        console.log('UPDATE public.user_profiles SET auth_role = role WHERE auth_role IS NULL;');
        console.log('');
      } else {
        console.log('❌ Error checking auth_role:', authRoleError.message);
      }
    } else {
      console.log('✅ auth_role column exists');
    }
    
    // Check for role column
    console.log('');
    console.log('🔍 Checking for role column...');
    
    const { data: roleTest, error: roleError } = await supabase
      .from('user_profiles')
      .select('role')
      .limit(1);
    
    if (roleError) {
      if (roleError.message.includes('column "role" does not exist')) {
        console.log('❌ role column is missing');
        console.log('');
        console.log('📋 SOLUTION: Add missing column');
        console.log('==============================');
        console.log('Run this SQL in Supabase Dashboard:');
        console.log('');
        console.log('ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT \'customer\';');
        console.log('');
      } else {
        console.log('❌ Error checking role:', roleError.message);
      }
    } else {
      console.log('✅ role column exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema().catch(console.error);