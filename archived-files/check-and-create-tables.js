import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('🔧 Database Table Checker');
  console.log('========================');
  console.log('');
  console.log('⚠️  Environment variables not found.');
  console.log('This script checks if required database tables exist.');
  console.log('');
  console.log('📋 Required Tables:');
  console.log('   ✅ user_profiles');
  console.log('   ✅ categories');
  console.log('   ✅ subcategories');
  console.log('   ✅ provider_services');
  console.log('   ✅ bookings (optional)');
  console.log('');
  console.log('🚀 To ensure all tables exist:');
  console.log('1. Run the complete-database-schema.sql in Supabase Dashboard');
  console.log('2. This will create all required tables and relationships');
  console.log('3. All TypeScript errors will be resolved');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const requiredTables = [
    'user_profiles',
    'categories', 
    'subcategories',
    'provider_services'
  ];
  
  const results = {};
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        results[table] = { exists: false, error: error.message };
      } else {
        results[table] = { exists: true, count: data?.length || 0 };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  console.log('');
  console.log('📊 Table Status:');
  console.log('================');
  
  let allTablesExist = true;
  
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table} - EXISTS`);
    } else {
      console.log(`❌ ${table} - MISSING (${result.error})`);
      allTablesExist = false;
    }
  }
  
  console.log('');
  
  if (allTablesExist) {
    console.log('🎉 All required tables exist!');
    console.log('✅ Your TypeScript errors should be minimal.');
    console.log('✅ Service registration should work properly.');
  } else {
    console.log('⚠️  Some tables are missing.');
    console.log('📋 To fix this:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Run the complete-database-schema.sql file');
    console.log('3. This will create all missing tables');
  }
  
  console.log('');
  console.log('🔧 Next steps:');
  console.log('- Run complete-database-schema.sql if tables are missing');
  console.log('- Test service registration in your app');
  console.log('- Check that license upload works properly');
}

checkTables().catch(console.error);