const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixServiceRegisterSection() {
  try {
    console.log('🔍 Checking admin_permissions table...');
    
    // Check if service-register-requests section exists
    const { data: existingSection, error: checkError } = await supabase
      .from('admin_permissions')
      .select('*')
      .eq('section', 'service-register-requests')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking admin_sections:', checkError);
      return;
    }
    
    if (!existingSection) {
      console.log('➕ Adding service-register-requests section to admin_sections...');
      
      const { error: insertError } = await supabase
        .from('admin_permissions')
        .insert({
          section: 'service-register-requests',
          display_name: 'Service Register Requests',
          description: 'Manage provider service registration requests',
          is_enabled: true,
          sort_order: 15
        });
      
      if (insertError) {
        console.error('❌ Error inserting admin section:', insertError);
        return;
      }
      
      console.log('✅ Service Register Requests section added successfully!');
    } else {
      console.log('✅ Service Register Requests section already exists');
      
      // Ensure it's enabled
      if (!existingSection.is_enabled) {
        console.log('🔧 Enabling service-register-requests section...');
        
        const { error: updateError } = await supabase
          .from('admin_permissions')
          .update({ is_enabled: true })
          .eq('section', 'service-register-requests');
        
        if (updateError) {
          console.error('❌ Error enabling section:', updateError);
          return;
        }
        
        console.log('✅ Service Register Requests section enabled!');
      }
    }
    
    // Check existing provider registration requests
    console.log('🔍 Checking provider_registration_requests table...');
    
    const { data: existingRequests, error: requestsError } = await supabase
      .from('provider_registration_requests')
      .select('*');
    
    if (requestsError) {
      console.error('❌ Error checking provider_registration_requests:', requestsError);
      return;
    }
    
    console.log(`📊 Found ${existingRequests?.length || 0} existing requests`);
    
    if (!existingRequests || existingRequests.length === 0) {
      console.log('➕ Adding sample provider registration requests...');
      
      const sampleRequests = [
        {
          business_name: 'Elite Cleaning Services',
          contact_person: 'John Smith',
          email: 'john@elitecleaning.com',
          phone: '+1-555-0123',
          business_address: '123 Main St, New York, NY 10001',
          business_type: 'Cleaning Services',
          services_offered: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning'],
          experience_years: 5,
          certifications: ['Licensed', 'Insured', 'Bonded'],
          business_documents: ['business_license.pdf', 'insurance_cert.pdf'],
          status: 'pending',
          submitted_at: new Date().toISOString()
        },
        {
          business_name: 'Pro Plumbing Solutions',
          contact_person: 'Sarah Johnson',
          email: 'sarah@proplumbing.com',
          phone: '+1-555-0456',
          business_address: '456 Oak Ave, Los Angeles, CA 90210',
          business_type: 'Plumbing Services',
          services_offered: ['Emergency Plumbing', 'Pipe Repair', 'Installation'],
          experience_years: 8,
          certifications: ['Licensed Plumber', 'EPA Certified'],
          business_documents: ['plumbing_license.pdf', 'epa_cert.pdf'],
          status: 'pending',
          submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          business_name: 'Garden Masters Landscaping',
          contact_person: 'Mike Wilson',
          email: 'mike@gardenmasters.com',
          phone: '+1-555-0789',
          business_address: '789 Pine St, Chicago, IL 60601',
          business_type: 'Landscaping Services',
          services_offered: ['Lawn Care', 'Garden Design', 'Tree Trimming'],
          experience_years: 12,
          certifications: ['Certified Arborist', 'Pesticide License'],
          business_documents: ['arborist_cert.pdf', 'pesticide_license.pdf'],
          status: 'approved',
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          reviewed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          reviewed_by: 'admin@example.com'
        }
      ];
      
      const { error: insertRequestsError } = await supabase
        .from('provider_registration_requests')
        .insert(sampleRequests);
      
      if (insertRequestsError) {
        console.error('❌ Error inserting sample requests:', insertRequestsError);
        return;
      }
      
      console.log('✅ Sample provider registration requests added successfully!');
    }
    
    console.log('🎉 Service Register Requests section is now ready!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixServiceRegisterSection();