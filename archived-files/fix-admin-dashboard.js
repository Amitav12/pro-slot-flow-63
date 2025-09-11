import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminDashboard() {
  console.log('🔧 Fixing Admin Dashboard...');
  
  // Check if admin_permissions table exists
  const { error: checkError } = await supabase
    .from('admin_permissions')
    .select('count')
    .limit(1);
  
  if (checkError && checkError.message.includes('relation "admin_permissions" does not exist')) {
    console.log('❌ admin_permissions table does not exist. Creating it...');
    
    // Create the table
    const { error: createError } = await supabase.rpc('create_admin_permissions_table');
    
    if (createError) {
      console.error('Failed to create table:', createError.message);
      console.log('Please run the 4-persona-auth-system.sql script manually in Supabase SQL Editor');
      return;
    }
  }
  
  // Populate the table with default permissions
  const permissions = [
    { section: 'users', display_name: 'User Management', description: 'Manage customer accounts and profiles', sort_order: 1, is_enabled: true },
    { section: 'providers', display_name: 'Provider Management', description: 'Manage service providers and approvals', sort_order: 2, is_enabled: true },
    { section: 'services', display_name: 'Service Management', description: 'Approve/reject provider services', sort_order: 3, is_enabled: true },
    { section: 'bookings', display_name: 'Booking Management', description: 'View and manage all bookings', sort_order: 4, is_enabled: true },
    { section: 'categories', display_name: 'Category Management', description: 'Manage service categories and subcategories', sort_order: 5, is_enabled: true },
    { section: 'locations', display_name: 'Location Management', description: 'Manage service locations', sort_order: 6, is_enabled: true },
    { section: 'reports', display_name: 'Reports & Analytics', description: 'View system reports and analytics', sort_order: 7, is_enabled: true },
    { section: 'payments', display_name: 'Payment Management', description: 'Manage payments and transactions', sort_order: 8, is_enabled: true },
    { section: 'notifications', display_name: 'Notification Center', description: 'Send system notifications', sort_order: 9, is_enabled: true },
    { section: 'settings', display_name: 'System Settings', description: 'Configure system-wide settings', sort_order: 10, is_enabled: true }
  ];
  
  // Insert permissions (enable all for super_admin)
  const { error: insertError } = await supabase
    .from('admin_permissions')
    .upsert(permissions, { onConflict: 'section' });
  
  if (insertError) {
    console.error('Failed to insert permissions:', insertError.message);
    return;
  }
  
  console.log('✅ Admin dashboard fixed! All sections are now enabled.');
  console.log('🔄 Please log out and log back in as super_admin to see the changes.');
}

fixAdminDashboard().catch(console.error);