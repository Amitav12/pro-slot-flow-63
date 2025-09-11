import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  console.log('🔍 Checking current RLS policies and table access...\n');
  
  const tables = ['categories', 'subcategories', 'locations', 'user_profiles', 'provider_services'];
  
  for (const table of tables) {
    console.log(`📋 Testing ${table}:`);
    
    try {
      // Test SELECT
      const { data: selectData, error: selectError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log(`  ❌ SELECT: ${selectError.message}`);
      } else {
        console.log(`  ✅ SELECT: OK (${selectData?.length || 0} records)`);
      }
      
      // Test INSERT (we'll try to insert and then delete)
      const testData = table === 'categories' ? 
        { name: 'Test Category', description: 'Test', is_active: true } :
        table === 'subcategories' ? 
        { name: 'Test Sub', category_id: 1, is_active: true } :
        table === 'locations' ? 
        { name: 'Test Location', address: 'Test Address', is_active: true } :
        table === 'user_profiles' ?
        { id: 'test-user-id', email: 'test@test.com', role: 'customer' } :
        { provider_id: 'test-provider', category_id: 1, name: 'Test Service', price: 100 };
      
      const { data: insertData, error: insertError } = await supabase
        .from(table)
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log(`  ❌ INSERT: ${insertError.message}`);
      } else {
        console.log(`  ✅ INSERT: OK`);
        
        // Clean up - delete the test record
        if (insertData && insertData.length > 0) {
          const idField = table === 'user_profiles' ? 'id' : 'id';
          await supabase
            .from(table)
            .delete()
            .eq(idField, insertData[0][idField]);
        }
      }
      
    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Summary:');
  console.log('If you see any RLS policy errors above, you should run the fix-policies.sql');
  console.log('in your Supabase SQL Editor to resolve them.');
}

checkPolicies();