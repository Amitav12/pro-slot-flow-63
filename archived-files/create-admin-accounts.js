import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🔐 Creating Admin and Super Admin Accounts');
console.log('==========================================');

// Check for environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('');
  console.log('⚠️  Environment Variables Required');
  console.log('==================================');
  console.log('');
  console.log('To create admin accounts, you need:');
  console.log('1. VITE_SUPABASE_URL - Your Supabase project URL');
  console.log('2. SUPABASE_SERVICE_ROLE_KEY - Your service role key');
  console.log('');
  console.log('📋 Manual Admin Account Creation:');
  console.log('=================================');
  console.log('');
  console.log('1. Go to Supabase Dashboard → Authentication → Users');
  console.log('2. Click "Add User" and create accounts with these details:');
  console.log('');
  console.log('🛡️  ADMIN ACCOUNT:');
  console.log('   Email: admin@proslotflow.com');
  console.log('   Password: Admin123!');
  console.log('   Role: admin');
  console.log('');
  console.log('👑 SUPER ADMIN ACCOUNT:');
  console.log('   Email: superadmin@proslotflow.com');
  console.log('   Password: SuperAdmin123!');
  console.log('   Role: super_admin');
  console.log('');
  console.log('3. After creating users, run this SQL in SQL Editor:');
  console.log('');
  console.log(`UPDATE user_profiles 
SET auth_role = 'admin', role = 'admin', full_name = 'System Admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@proslotflow.com');

UPDATE user_profiles 
SET auth_role = 'super_admin', role = 'super_admin', full_name = 'Super Administrator'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@proslotflow.com');`);
  console.log('');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAccounts() {
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
  console.log('👑 Creating Admin Accounts...');
  
  const adminAccounts = [
    {
      email: 'admin@proslotflow.com',
      password: 'Admin123!',
      role: 'admin',
      fullName: 'System Admin'
    },
    {
      email: 'superadmin@proslotflow.com',
      password: 'SuperAdmin123!',
      role: 'super_admin',
      fullName: 'Super Administrator'
    }
  ];

  for (const account of adminAccounts) {
    try {
      console.log(`\n🔐 Creating ${account.role} account...`);
      
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
          role: account.role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User ${account.email} already exists`);
          
          // Try to update existing profile
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              auth_role: account.role,
              role: account.role,
              full_name: account.fullName,
              onboarding_completed: true,
              registration_status: 'approved'
            })
            .eq('user_id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === account.email)?.id);

          if (updateError) {
            console.log(`❌ Failed to update profile: ${updateError.message}`);
          } else {
            console.log(`✅ Updated existing ${account.role} profile`);
          }
          continue;
        }
        throw authError;
      }

      if (authData.user) {
        console.log(`✅ Created auth user: ${account.email}`);
        
        // Update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            auth_role: account.role,
            role: account.role,
            full_name: account.fullName,
            onboarding_completed: true,
            registration_status: 'approved'
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.log(`⚠️  Profile update warning: ${profileError.message}`);
        } else {
          console.log(`✅ Updated ${account.role} profile`);
        }
      }

      console.log(`🎉 ${account.role.toUpperCase()} account created successfully!`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      
    } catch (error) {
      console.log(`❌ Failed to create ${account.role} account:`, error.message);
    }
  }

  console.log('');
  console.log('🎯 Admin Account Summary:');
  console.log('=========================');
  console.log('');
  console.log('🛡️  ADMIN ACCOUNT:');
  console.log('   Email: admin@proslotflow.com');
  console.log('   Password: Admin123!');
  console.log('   Access: Limited admin sections (controlled by Super Admin)');
  console.log('');
  console.log('👑 SUPER ADMIN ACCOUNT:');
  console.log('   Email: superadmin@proslotflow.com');
  console.log('   Password: SuperAdmin123!');
  console.log('   Access: Full system access + permission control');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('==============');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Go to: http://localhost:8080/auth');
  console.log('3. Login with either admin account');
  console.log('4. Super Admin can control which sections Admin can access');
  console.log('5. Test the permission system by toggling admin sections');
  console.log('');
  console.log('🔒 Security Notes:');
  console.log('==================');
  console.log('• Change these passwords in production');
  console.log('• Admin accounts are created with backend access only');
  console.log('• Customer/Provider accounts use the signup form');
  console.log('• All admin actions are logged for security');
}

createAdminAccounts().catch(console.error);