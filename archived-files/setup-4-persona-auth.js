import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Setting up 4-Persona Authentication System');
console.log('==============================================');

// Check for environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('');
  console.log('⚠️  Environment Variables Required');
  console.log('==================================');
  console.log('');
  console.log('To set up the 4-persona authentication system, you need:');
  console.log('');
  console.log('1. VITE_SUPABASE_URL - Your Supabase project URL');
  console.log('2. SUPABASE_SERVICE_ROLE_KEY - Your service role key (for admin functions)');
  console.log('   OR VITE_SUPABASE_ANON_KEY - Your anon key (limited functionality)');
  console.log('');
  console.log('📋 Manual Setup Instructions:');
  console.log('=============================');
  console.log('');
  console.log('1. Open Supabase Dashboard → SQL Editor');
  console.log('2. Copy and run: 4-persona-auth-system.sql');
  console.log('3. This will create:');
  console.log('   ✅ Enhanced user profiles with auth_role');
  console.log('   ✅ Admin permissions table');
  console.log('   ✅ Role hierarchy system');
  console.log('   ✅ Comprehensive RLS policies');
  console.log('   ✅ Helper functions for role management');
  console.log('');
  console.log('4. Update your app to use the new components:');
  console.log('   ✅ Wrap app with AuthProvider');
  console.log('   ✅ Use RoleBasedRoute for protected routes');
  console.log('   ✅ Replace admin dashboard with EnhancedAdminDashboard');
  console.log('');
  console.log('🎯 Features You\'ll Get:');
  console.log('=======================');
  console.log('• Customer Dashboard - Personal bookings and services');
  console.log('• Provider Dashboard - Service management and bookings');
  console.log('• Admin Dashboard - Sections controlled by Super Admin');
  console.log('• Super Admin Dashboard - Full control + permission management');
  console.log('• Role-based routing and access control');
  console.log('• Real-time permission updates');
  console.log('• Comprehensive audit logging');
  console.log('');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuthSystem() {
  console.log('');
  console.log('🔧 Checking Database Connection...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error && !error.message.includes('relation "user_profiles" does not exist')) {
      throw error;
    }
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('');
    console.log('Please check your Supabase credentials and try again.');
    process.exit(1);
  }

  console.log('');
  console.log('📊 Checking Current Schema...');
  
  // Check if tables exist
  const tables = ['user_profiles', 'admin_permissions', 'role_hierarchy'];
  const tableStatus = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      tableStatus[table] = !error;
      console.log(`${tableStatus[table] ? '✅' : '❌'} ${table}`);
    } catch (error) {
      tableStatus[table] = false;
      console.log(`❌ ${table}`);
    }
  }

  console.log('');
  console.log('🎯 Setup Status:');
  console.log('================');
  
  if (tableStatus.user_profiles && tableStatus.admin_permissions && tableStatus.role_hierarchy) {
    console.log('✅ 4-Persona Auth System appears to be set up!');
    console.log('');
    console.log('🧪 Testing Admin Permissions...');
    
    try {
      const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('*')
        .limit(5);
      
      console.log(`✅ Found ${permissions?.length || 0} admin permission sections`);
      
      if (permissions && permissions.length > 0) {
        console.log('');
        console.log('📋 Available Admin Sections:');
        permissions.forEach(p => {
          console.log(`   ${p.is_enabled ? '✅' : '❌'} ${p.display_name} (${p.section})`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking admin permissions:', error.message);
    }
    
    console.log('');
    console.log('🎉 System Ready!');
    console.log('================');
    console.log('');
    console.log('Your 4-persona authentication system is set up and ready to use:');
    console.log('');
    console.log('👥 User Roles:');
    console.log('• Customer - Can book services and manage personal data');
    console.log('• Provider - Can manage services and view bookings');
    console.log('• Admin - Can access sections enabled by Super Admin');
    console.log('• Super Admin - Full access + controls Admin permissions');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Update your app routing to use RoleBasedRoute components');
    console.log('2. Replace existing dashboards with role-specific versions');
    console.log('3. Test the permission system with different user roles');
    console.log('4. Configure admin permissions via Super Admin dashboard');
    
  } else {
    console.log('⚠️  Setup Required');
    console.log('');
    console.log('The 4-persona authentication system needs to be set up.');
    console.log('');
    console.log('📋 Setup Instructions:');
    console.log('======================');
    console.log('');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy the contents of: 4-persona-auth-system.sql');
    console.log('4. Paste and execute the SQL');
    console.log('');
    console.log('This will create all necessary tables, policies, and functions.');
  }

  console.log('');
  console.log('📚 Documentation:');
  console.log('==================');
  console.log('');
  console.log('• Authentication Hook: src/hooks/useAuth.tsx');
  console.log('• Admin Permissions: src/hooks/useAdminPermissions.tsx');
  console.log('• Role-based Routes: src/components/auth/RoleBasedRoute.tsx');
  console.log('• Admin Dashboard: src/components/admin/EnhancedAdminDashboard.tsx');
  console.log('• Permissions Panel: src/components/admin/AdminPermissionsPanel.tsx');
  console.log('• User Management: src/components/admin/UserRoleManager.tsx');
  console.log('');
  console.log('💡 Pro Tips:');
  console.log('============');
  console.log('• Use AuthProvider at your app root');
  console.log('• Wrap protected routes with appropriate RoleBasedRoute components');
  console.log('• Super Admin can control which sections Admin users can access');
  console.log('• All role changes are audited and logged');
  console.log('• Permissions update in real-time across all admin sessions');
}

setupAuthSystem().catch(console.error);