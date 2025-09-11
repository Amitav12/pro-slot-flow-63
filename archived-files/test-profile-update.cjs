const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env file
const envPath = path.join(__dirname, '.env');
let supabaseUrl, supabaseKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.+)/);
  
  supabaseUrl = urlMatch ? urlMatch[1].trim().replace(/"/g, '') : null;
  supabaseKey = keyMatch ? keyMatch[1].trim().replace(/"/g, '') : null;
}

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Could not find Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality');
  console.log('======================================');
  
  try {
    // 1. Check table structure
    console.log('\n1. Checking user_profiles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error accessing user_profiles table:', tableError.message);
      return;
    }
    
    console.log('✅ user_profiles table accessible');
    
    if (tableData && tableData.length > 0) {
      const columns = Object.keys(tableData[0]);
      console.log('📋 Available columns:', columns.join(', '));
      
      // Check for required columns
      const requiredColumns = ['user_id', 'full_name', 'phone', 'address', 'city'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing required columns:', missingColumns.join(', '));
      } else {
        console.log('✅ All required columns present');
      }
    } else {
      console.log('📋 Table is empty, cannot check column structure');
    }
    
    // 2. Test insert operation
    console.log('\n2. Testing profile creation...');
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: testUserId,
        full_name: 'Test User',
        phone: '1234567890',
        address: '123 Test Street',
        city: 'Test City',
        role: 'customer',
        auth_role: 'customer',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Profile creation failed:', insertError.message);
      console.log('Error details:', {
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Profile creation successful');
      console.log('Created profile:', insertData);
    }
    
    // 3. Test update operation
    console.log('\n3. Testing profile update...');
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: 'Updated Test User',
        phone: '9876543210',
        address: '456 Updated Street',
        city: 'Updated City',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUserId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Profile update failed:', updateError.message);
      console.log('Error details:', {
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      });
    } else {
      console.log('✅ Profile update successful');
      console.log('Updated profile:', updateData);
    }
    
    // 4. Clean up test data
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    if (deleteError) {
      console.log('⚠️  Could not clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileUpdate().catch(console.error);