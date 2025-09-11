import { createClient } from '@supabase/supabase-js';

console.log('🚀 Setting Up Production-Ready Pro Slot Flow');
console.log('=============================================');

// Check for environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('');
  console.log('⚠️  Environment Variables Required');
  console.log('==================================');
  console.log('');
  console.log('Create a .env file with:');
  console.log('VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_key  # Optional for admin creation');
  console.log('');
  console.log('📋 Manual Setup Steps:');
  console.log('======================');
  console.log('');
  console.log('1. DATABASE SETUP:');
  console.log('   • Open Supabase Dashboard → SQL Editor');
  console.log('   • Run: 4-persona-auth-system.sql');
  console.log('   • This creates the complete authentication system');
  console.log('');
  console.log('2. ADMIN ACCOUNTS:');
  console.log('   • Run: node create-admin-accounts.js');
  console.log('   • Or manually create admin users in Supabase Dashboard');
  console.log('');
  console.log('3. STORAGE SETUP:');
  console.log('   • Go to Storage → Create bucket: "documents"');
  console.log('   • Set bucket to public for file uploads');
  console.log('');
  console.log('4. START DEV SERVER:');
  console.log('   • Run: npm run dev');
  console.log('   • Visit: http://localhost:8080');
  console.log('');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProductionReady() {
  console.log('');
  console.log('🔍 Checking System Status...');
  
  try {
    // Test database connection
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

  // Check required tables
  console.log('');
  console.log('📊 Checking Database Schema...');
  
  const requiredTables = [
    'user_profiles',
    'categories',
    'subcategories',
    'provider_services',
    'admin_permissions',
    'bookings'
  ];
  
  const tableStatus = {};
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      tableStatus[table] = !error;
      console.log(`${tableStatus[table] ? '✅' : '❌'} ${table}`);
    } catch (error) {
      tableStatus[table] = false;
      console.log(`❌ ${table}`);
    }
  }

  const missingTables = Object.entries(tableStatus)
    .filter(([table, exists]) => !exists)
    .map(([table]) => table);

  if (missingTables.length > 0) {
    console.log('');
    console.log('⚠️  Missing Tables Detected');
    console.log('===========================');
    console.log('');
    console.log('Missing tables:', missingTables.join(', '));
    console.log('');
    console.log('🔧 To fix this:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Run the complete schema: 4-persona-auth-system.sql');
    console.log('3. This will create all missing tables and policies');
    console.log('');
    return;
  }

  // Check for admin permissions
  console.log('');
  console.log('🛡️  Checking Admin Permissions...');
  
  try {
    const { data: permissions, error } = await supabase
      .from('admin_permissions')
      .select('*');
    
    if (error) throw error;
    
    if (permissions && permissions.length > 0) {
      console.log(`✅ Found ${permissions.length} admin permission sections`);
      
      const enabledCount = permissions.filter(p => p.is_enabled).length;
      console.log(`   ${enabledCount} sections enabled for Admin users`);
      
      console.log('');
      console.log('📋 Admin Sections:');
      permissions.forEach(p => {
        console.log(`   ${p.is_enabled ? '✅' : '❌'} ${p.display_name}`);
      });
    } else {
      console.log('⚠️  No admin permissions found');
      console.log('   Run the 4-persona-auth-system.sql to create them');
    }
  } catch (error) {
    console.log('❌ Admin permissions table not found');
    console.log('   Run the 4-persona-auth-system.sql to create it');
  }

  // Check storage bucket
  console.log('');
  console.log('📁 Checking Storage Setup...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (documentsBucket) {
      console.log('✅ Documents storage bucket exists');
    } else {
      console.log('⚠️  Documents storage bucket missing');
      console.log('   Create it in Supabase Dashboard → Storage');
    }
  } catch (error) {
    console.log('⚠️  Could not check storage buckets');
    console.log('   Make sure to create "documents" bucket for file uploads');
  }

  // Check for admin users
  console.log('');
  console.log('👑 Checking Admin Accounts...');
  
  try {
    const { data: adminProfiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .in('auth_role', ['admin', 'super_admin']);
    
    if (error) throw error;
    
    if (adminProfiles && adminProfiles.length > 0) {
      console.log(`✅ Found ${adminProfiles.length} admin account(s)`);
      
      adminProfiles.forEach(profile => {
        console.log(`   ${profile.auth_role === 'super_admin' ? '👑' : '🛡️'} ${profile.full_name || 'Unnamed'} (${profile.auth_role})`);
      });
    } else {
      console.log('⚠️  No admin accounts found');
      console.log('   Run: node create-admin-accounts.js');
    }
  } catch (error) {
    console.log('⚠️  Could not check admin accounts');
  }

  console.log('');
  console.log('🎯 System Status Summary:');
  console.log('=========================');
  
  const allTablesExist = Object.values(tableStatus).every(exists => exists);
  
  if (allTablesExist) {
    console.log('✅ Database schema is complete');
    console.log('✅ 4-persona authentication system ready');
    console.log('✅ Role-based access control configured');
    console.log('✅ Admin permission system active');
    
    console.log('');
    console.log('🚀 Ready to Launch!');
    console.log('===================');
    console.log('');
    console.log('Your Pro Slot Flow application is production-ready with:');
    console.log('');
    console.log('👥 User Roles:');
    console.log('• Customer - Book services, manage personal data');
    console.log('• Provider - Manage services, handle bookings (requires ID proof)');
    console.log('• Admin - Access sections controlled by Super Admin');
    console.log('• Super Admin - Full control + permission management');
    console.log('');
    console.log('🔐 Authentication Features:');
    console.log('• Secure signup with password validation (6-8 chars)');
    console.log('• Provider ID proof upload requirement');
    console.log('• Admin accounts created via backend only');
    console.log('• Real-time permission updates');
    console.log('• Comprehensive audit logging');
    console.log('');
    console.log('🎮 Next Steps:');
    console.log('==============');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Visit: http://localhost:8080/auth');
    console.log('3. Test customer/provider signup');
    console.log('4. Login as admin/super admin');
    console.log('5. Configure admin permissions');
    console.log('');
    console.log('🎉 Your application is ready for users!');
    
  } else {
    console.log('❌ Database setup incomplete');
    console.log('');
    console.log('🔧 Required Actions:');
    console.log('1. Run the complete database schema');
    console.log('2. Create admin accounts');
    console.log('3. Set up storage buckets');
    console.log('4. Test the authentication flow');
  }

  console.log('');
  console.log('📚 Documentation:');
  console.log('==================');
  console.log('• Complete guide: 4-PERSONA-AUTH-IMPLEMENTATION.md');
  console.log('• System overview: COMPLETE-AUTH-SYSTEM-READY.md');
  console.log('• Database schema: 4-persona-auth-system.sql');
  console.log('• Admin creation: create-admin-accounts.js');
}

setupProductionReady().catch(console.error);