import { createClient } from '@supabase/supabase-js';

// This script adds missing admin sections to the admin_permissions table
// Run this when you have access to your Supabase database

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingAdminSections() {
  console.log('🔧 Adding missing admin sections...');
  
  const missingSections = [
    {
      section: 'special-offers',
      display_name: 'Special Offers',
      description: 'Manage promotional offers and discounts',
      is_enabled: true,
      sort_order: 12
    },
    {
      section: 'video-gallery',
      display_name: 'Video Gallery',
      description: 'Manage video content and gallery',
      is_enabled: true,
      sort_order: 13
    },
    {
      section: 'service-management',
      display_name: 'Service Status Control',
      description: 'Control service status and availability',
      is_enabled: true,
      sort_order: 14
    },
    {
      section: 'popular-services',
      display_name: 'Popular Services',
      description: 'Manage featured and popular services',
      is_enabled: true,
      sort_order: 15
    }
  ];

  try {
    // Insert or update the missing sections
    const { data, error } = await supabase
      .from('admin_permissions')
      .upsert(missingSections, { onConflict: 'section' });

    if (error) {
      console.error('❌ Error adding sections:', error.message);
      return;
    }

    console.log('✅ Successfully added missing admin sections!');
    console.log('📋 Added sections:', missingSections.map(s => s.section).join(', '));
    console.log('🔄 Please refresh your admin dashboard to see the changes.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the script
addMissingAdminSections().catch(console.error);