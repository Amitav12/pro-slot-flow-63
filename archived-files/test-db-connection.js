// Test Supabase database connection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://igezuyqvfoxolxbudcyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n📋 To fix this issue:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project: igezuyqvfoxolxbudcyj');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the contents of setup-database.sql');
      console.log('5. Click "Run" to execute the SQL');
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Categories table exists and is accessible');
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 Testing required tables...');
  
  const tables = [
    'categories',
    'subcategories', 
    'locations',
    'user_profiles',
    'provider_services'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}' - ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' - OK`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - ${err.message}`);
    }
  }
}

async function testSampleData() {
  console.log('\n🔍 Testing sample data...');
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
      
    if (error) {
      console.log('❌ No sample categories found');
      return;
    }
    
    console.log(`✅ Found ${categories.length} sample categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name}`);
    });
    
  } catch (err) {
    console.log('❌ Error fetching sample data:', err.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Supabase Database Tests\n');
  
  const connected = await testConnection();
  if (connected) {
    await testTables();
    await testSampleData();
  }
  
  console.log('\n✨ Test completed!');
}

runTests();