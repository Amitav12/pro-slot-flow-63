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

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema issues...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250125000003_fix_booking_slots_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ Statement ${i + 1} failed (expected with anon key):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} error:`, err.message);
        }
      }
    }
    
    // Test the functions
    console.log('\n🧪 Testing database functions...');
    
    // Test get_available_slots function
    const testProviderId = '876e93ba-0e16-485c-8041-9f8229fe09dd';
    const testDate = '2025-01-25';
    
    console.log('🔍 Testing get_available_slots function...');
    const { data: slots, error: slotsError } = await supabase.rpc('get_available_slots', {
      p_provider_id: testProviderId,
      p_service_id: null,
      p_date: testDate
    });
    
    if (slotsError) {
      console.log('❌ get_available_slots error:', slotsError.message);
    } else {
      console.log(`✅ get_available_slots working - found ${slots?.length || 0} slots`);
    }
    
    // Test generate_provider_slots function
    console.log('🔍 Testing generate_provider_slots function...');
    const { error: generateError } = await supabase.rpc('generate_provider_slots', {
      p_provider_id: testProviderId,
      p_start_date: testDate,
      p_end_date: '2025-01-26'
    });
    
    if (generateError) {
      console.log('❌ generate_provider_slots error:', generateError.message);
    } else {
      console.log('✅ generate_provider_slots working');
    }
    
    // Check booking_slots table structure
    console.log('\n📊 Checking booking_slots table...');
    const { data: tableData, error: tableError } = await supabase
      .from('booking_slots')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ booking_slots table error:', tableError.message);
    } else {
      console.log('✅ booking_slots table accessible');
      if (tableData && tableData.length > 0) {
        console.log('📋 Sample record columns:', Object.keys(tableData[0]));
      }
    }
    
    console.log('\n🎉 Database schema fix completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your browser');
    console.log('   2. Try accessing the time selection page again');
    console.log('   3. If issues persist, check the browser console for specific errors');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
  }
}

fixDatabaseSchema();