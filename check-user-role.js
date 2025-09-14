import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentUser() {
  console.log('🔍 Checking current user session and role...');
  console.log('==========================================');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      console.log('💡 You need to sign in first');
      return;
    }
    
    console.log('✅ Active session found');
    console.log('📧 Email:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    console.log('');
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('auth_role, role, full_name, is_blocked')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      
      if (profileError.code === 'PGRST116') {
        console.log('💡 No profile found - you may need to complete registration');
      }
      return;
    }
    
    console.log('✅ User profile found:');
    console.log('👤 Full Name:', profile.full_name || 'Not set');
    console.log('🎭 Role:', profile.role || 'Not set');
    console.log('🔐 Auth Role:', profile.auth_role || 'Not set');
    console.log('🚫 Blocked:', profile.is_blocked ? 'Yes' : 'No');
    console.log('');
    
    // Check super admin status
    if (profile.auth_role === 'super_admin') {
      console.log('🎉 CONFIRMED: You are a Super Admin!');
      console.log('✅ You have full access to all platform features');
      console.log('✅ You can create/modify platform fees');
    } else {
      console.log('⚠️  Current role is not Super Admin');
      console.log('💡 To fix the RLS policy issue, you need super_admin role');
      console.log('');
      console.log('🔧 SOLUTION: Update your role to super_admin');
      console.log('Run this SQL in Supabase Dashboard → SQL Editor:');
      console.log('');
      console.log(`UPDATE public.user_profiles`);
      console.log(`SET auth_role = 'super_admin', role = 'super_admin'`);
      console.log(`WHERE user_id = '${session.user.id}';`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkCurrentUser().catch(console.error);