// Inspect Supabase database structure and data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://igezuyqvfoxolxbudcyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function inspectDatabase() {
  console.log('🔍 Inspecting Supabase Database Structure\n');
  
  const tables = [
    'categories',
    'subcategories', 
    'locations',
    'user_profiles',
    'provider_services'
  ];
  
  for (const table of tables) {
    console.log(`\n📋 TABLE: ${table.toUpperCase()}`);
    console.log('=' .repeat(50));
    
    try {
      // Get table data
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(10);
        
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log('📭 No data found');
        continue;
      }
      
      console.log(`📊 Found ${data.length} records`);
      
      // Show column structure from first record
      if (data[0]) {
        console.log('\n🏗️  Column Structure:');
        Object.keys(data[0]).forEach(key => {
          const value = data[0][key];
          const type = typeof value;
          console.log(`   ${key}: ${type} ${value === null ? '(nullable)' : ''}`);
        });
      }
      
      // Show sample data
      console.log('\n📝 Sample Data:');
      data.slice(0, 3).forEach((record, index) => {
        console.log(`\n   Record ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              typeof value === 'string' && value.length > 50 ? 
                              value.substring(0, 50) + '...' : value;
          console.log(`     ${key}: ${displayValue}`);
        });
      });
      
    } catch (err) {
      console.log(`❌ Error inspecting ${table}:`, err.message);
    }
  }
  
  // Check relationships
  console.log('\n\n🔗 CHECKING RELATIONSHIPS');
  console.log('=' .repeat(50));
  
  try {
    // Categories with subcategories
    const { data: categoriesWithSubs } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories(*)
      `)
      .limit(3);
      
    if (categoriesWithSubs) {
      console.log('\n📊 Categories with Subcategories:');
      categoriesWithSubs.forEach(cat => {
        console.log(`   ${cat.name}: ${cat.subcategories?.length || 0} subcategories`);
      });
    }
    
  } catch (err) {
    console.log('❌ Error checking relationships:', err.message);
  }
  
  console.log('\n✨ Database inspection completed!');
}

inspectDatabase();