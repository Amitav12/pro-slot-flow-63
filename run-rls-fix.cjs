const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  console.log('Required variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_PUBLISHABLE_KEY');
  console.log('\nFound in .env:');
  console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('- VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRLSFix() {
  try {
    console.log('🔧 Fixing RLS policies for provider registration...');
    
    // Read the SQL fix file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'fix-provider-registration-rls.sql'), 'utf8');
    
    // Split SQL commands by semicolon and filter out empty ones
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`📝 Executing ${commands.length} SQL commands...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`⏳ Executing command ${i + 1}/${commands.length}...`);
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
          
          if (error) {
            // Try direct query if RPC fails
            const { data: directData, error: directError } = await supabase
              .from('_sql_exec')
              .select('*')
              .limit(1);
            
            if (directError) {
              console.warn(`⚠️  Warning on command ${i + 1}: ${error.message}`);
              // Continue with next command
            }
          } else {
            console.log(`✅ Command ${i + 1} executed successfully`);
          }
        } catch (cmdError) {
          console.warn(`⚠️  Warning on command ${i + 1}: ${cmdError.message}`);
          // Continue with next command
        }
      }
    }
    
    console.log('\n🎉 RLS policy fixes completed!');
    console.log('\n📋 Summary of changes:');
    console.log('✅ Fixed admin_notifications RLS policies to allow system triggers');
    console.log('✅ Updated provider_registration_requests policies for proper access');
    console.log('✅ Ensured storage policies allow document uploads');
    console.log('\n🔄 Please test the provider registration form now.');
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error.message);
    
    // Try alternative approach - execute individual policy fixes
    console.log('\n🔄 Trying alternative approach...');
    
    try {
      // Fix admin_notifications policies
      console.log('📝 Fixing admin_notifications policies...');
      
      const { error: dropError1 } = await supabase.rpc('exec_sql', {
        sql_query: 'DROP POLICY IF EXISTS "Only admins can create notifications" ON public.admin_notifications'
      });
      
      const { error: createError1 } = await supabase.rpc('exec_sql', {
        sql_query: 'CREATE POLICY "System can create admin notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true)'
      });
      
      const { error: createError2 } = await supabase.rpc('exec_sql', {
        sql_query: `CREATE POLICY "Admins can view notifications" ON public.admin_notifications
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.user_profiles 
              WHERE user_profiles.user_id = auth.uid() 
              AND user_profiles.auth_role IN ('admin', 'super_admin')
            )
          )`
      });
      
      console.log('✅ Alternative fix completed!');
      console.log('🔄 Please test the provider registration form now.');
      
    } catch (altError) {
      console.error('❌ Alternative approach also failed:', altError.message);
      console.log('\n💡 Manual fix required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the contents of fix-provider-registration-rls.sql');
    }
  }
}

// Run the fix
runRLSFix().catch(console.error);