const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFunctionFix() {
  console.log('🔧 Applying get_available_slots function fix...');
  
  try {
    // Read the function fix file
    const fixPath = path.join(__dirname, 'fix-get-available-slots.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    
    console.log('📄 Function fix loaded successfully');
    
    // Try to execute the function directly using raw SQL
    console.log('⚡ Applying function fix...');
    
    // Since we can't use exec_sql with anon key, let's try a different approach
    // We'll use the rpc method to call a function that might exist
    
    // First, let's test the current function to see the exact error
    console.log('🧪 Testing current get_available_slots function...');
    const testProviderId = '876e93ba-0e16-485c-8041-9f8229fe09dd';
    const testDate = '2025-01-25';
    
    const { data: slots, error: slotsError } = await supabase.rpc('get_available_slots', {
      p_provider_id: testProviderId,
      p_service_id: null,
      p_date: testDate
    });
    
    if (slotsError) {
      console.log('❌ Current function error:', slotsError.message);
      console.log('📝 Error details:', slotsError);
    } else {
      console.log(`✅ Function working - found ${slots?.length || 0} slots`);
    }
    
    // Check if we can access the booking_slots table directly
    console.log('\n📊 Testing direct table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('provider_id', testProviderId)
      .eq('slot_date', testDate)
      .limit(5);
    
    if (tableError) {
      console.log('❌ Table access error:', tableError.message);
    } else {
      console.log(`✅ Direct table access working - found ${tableData?.length || 0} records`);
      if (tableData && tableData.length > 0) {
        console.log('📋 Sample record:', tableData[0]);
      }
    }
    
    console.log('\n💡 Function fix information:');
    console.log('   - The fix addresses ambiguous column reference in UPDATE statement');
    console.log('   - Qualifies all column references with table names');
    console.log('   - Cannot be applied directly with anonymous key');
    console.log('   - Requires service role key or database admin access');
    
    console.log('\n🎯 Recommended next steps:');
    console.log('   1. Apply the fix using Supabase dashboard SQL editor');
    console.log('   2. Or use service role key if available');
    console.log('   3. The fix SQL is available in fix-get-available-slots.sql');
    
  } catch (error) {
    console.error('❌ Error applying function fix:', error.message);
  }
}

applyFunctionFix();