import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service key (bypasses RLS)
const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc0NDEyMSwiZXhwIjoyMDcyMzIwMTIxfQ.YOUR_SERVICE_KEY_HERE'; // You need to get this from Supabase Dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setUserAsSuperAdmin() {
  console.log('🔧 Setting up Super Admin access...');
  console.log('=====================================');
  
  try {
    // First, let's check what users exist
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error listing users:', usersError.message);
      console.log('💡 You need to provide the correct service key');
      console.log('🔑 Get it from: Supabase Dashboard → Settings → API → service_role key');
      return;
    }
    
    console.log('✅ Found', users.users.length, 'users in the system');
    
    if (users.users.length === 0) {
      console.log('❌ No users found. Please sign up first.');
      return;
    }
    
    // Show all users and let you choose
    console.log('\n📋 Available users:');
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    // For now, let's update the first user to super admin
    const targetUser = users.users[0];
    console.log(`\n🎯 Setting ${targetUser.email} as Super Admin...`);
    
    // Update user profile to super admin
    const { data: updateResult, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: targetUser.id,
        auth_role: 'super_admin',
        role: 'super_admin',
        full_name: targetUser.email?.split('@')[0] || 'Super Admin',
        onboarding_completed: true,
        registration_status: 'approved',
        is_blocked: false,
        updated_at: new Date().toISOString()
      });
    
    if (updateError) {
      console.log('❌ Error updating profile:', updateError.message);
      return;
    }
    
    console.log('✅ Successfully set user as Super Admin!');
    console.log('🎉 You now have full access to all platform features');
    console.log('✅ You can create/modify platform fees');
    console.log('\n💡 Now sign in with:', targetUser.email);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n🔧 ALTERNATIVE SOLUTION:');
    console.log('Run this SQL directly in Supabase Dashboard → SQL Editor:');
    console.log('');
    console.log('-- Update any existing user to super admin');
    console.log('UPDATE public.user_profiles');
    console.log('SET auth_role = \'super_admin\', role = \'super_admin\'');
    console.log('WHERE user_id = (');
    console.log('  SELECT id FROM auth.users');
    console.log('  ORDER BY created_at DESC');
    console.log('  LIMIT 1');
    console.log(');');
    console.log('');
    console.log('-- Or create a new super admin profile if none exists');
    console.log('INSERT INTO public.user_profiles (');
    console.log('  user_id, auth_role, role, full_name, onboarding_completed');
    console.log(') VALUES (');
    console.log('  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),');
    console.log('  \'super_admin\', \'super_admin\', \'Super Admin\', true');
    console.log(') ON CONFLICT (user_id) DO UPDATE SET');
    console.log('  auth_role = \'super_admin\', role = \'super_admin\';');
  }
}

setUserAsSuperAdmin().catch(console.error);