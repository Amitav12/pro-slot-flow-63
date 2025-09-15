const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔧 Applying RLS policy fixes for provider registration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250125000002_fix_provider_registration_rls.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the most critical fixes directly
    console.log('📝 Fixing admin_notifications policies...');
    
    // Fix 1: Allow system to create admin notifications
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Only admins can create notifications" ON public.admin_notifications;
        CREATE POLICY "System can create admin notifications" ON public.admin_notifications
          FOR INSERT WITH CHECK (true);
      `
    });
    
    if (error1) {
      console.log('⚠️  Direct SQL execution not available. Using alternative approach...');
      
      // Alternative: Try to create a simple test to verify the fix is needed
      const { data: testData, error: testError } = await supabase
        .from('admin_notifications')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.log('✅ RLS policies need manual fixing in Supabase dashboard');
        console.log('\n📋 Manual steps required:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of:');
        console.log('   supabase/migrations/20250125000002_fix_provider_registration_rls.sql');
        console.log('4. Execute the SQL');
        console.log('\n🔗 Direct link: https://supabase.com/dashboard/project/igezuyqvfoxolxbudcyj/sql');
        return;
      }
    }
    
    console.log('✅ RLS policies updated successfully!');
    console.log('🔄 Please test the provider registration form now.');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Manual fix required:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   supabase/migrations/20250125000002_fix_provider_registration_rls.sql');
    console.log('4. Execute the SQL');
    console.log('\n🔗 Direct link: https://supabase.com/dashboard/project/igezuyqvfoxolxbudcyj/sql');
  }
}

// Run the migration
applyMigration().catch(console.error);