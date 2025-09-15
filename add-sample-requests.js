import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function addSampleRequests() {
  try {
    console.log('Adding sample provider registration requests...');
    
    // Get existing categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (catError) {
      console.error('Error fetching categories:', catError);
      return;
    }
    
    if (!categories || categories.length === 0) {
      console.log('No categories found. Creating sample categories first...');
      
      const sampleCategories = [
        { name: 'Beauty & Personal Care', description: 'Beauty and personal care services' },
        { name: 'Home Cleaning', description: 'Professional home cleaning services' },
        { name: 'Plumbing', description: 'Plumbing repair and installation services' }
      ];
      
      const { data: newCategories, error: createCatError } = await supabase
        .from('categories')
        .insert(sampleCategories)
        .select();
        
      if (createCatError) {
        console.error('Error creating categories:', createCatError);
        return;
      }
      
      console.log('Created sample categories:', newCategories);
    }
    
    // Fetch categories again
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3);
    
    const sampleRequests = [
      {
        business_name: 'Elite Cleaning Services',
        contact_person: 'Sarah Johnson',
        phone: '+1-555-0123',
        email: 'sarah@elitecleaning.com',
        address: '123 Main Street, Downtown, City 12345',
        license_number: 'CL-2024-001',
        experience_years: 8,
        category_id: finalCategories[0]?.id,
        description: 'Professional residential and commercial cleaning services with eco-friendly products.',
        status: 'pending'
      },
      {
        business_name: 'Perfect Plumbing Solutions',
        contact_person: 'Mike Rodriguez',
        phone: '+1-555-0456',
        email: 'mike@perfectplumbing.com',
        address: '456 Oak Avenue, Riverside, City 12346',
        license_number: 'PL-2024-002',
        experience_years: 12,
        category_id: finalCategories[1]?.id,
        description: 'Expert plumbing services including emergency repairs, installations, and maintenance.',
        status: 'pending'
      },
      {
        business_name: 'Glamour Beauty Studio',
        contact_person: 'Emma Davis',
        phone: '+1-555-0789',
        email: 'emma@glamourbeauty.com',
        address: '789 Beauty Lane, Uptown, City 12347',
        license_number: 'BT-2024-003',
        experience_years: 6,
        category_id: finalCategories[2]?.id,
        description: 'Full-service beauty studio offering hair, nails, and skincare treatments.',
        status: 'pending'
      },
      {
        business_name: 'QuickFix Handyman Services',
        contact_person: 'David Wilson',
        phone: '+1-555-0321',
        email: 'david@quickfixhandyman.com',
        address: '321 Repair Road, Suburbs, City 12348',
        license_number: 'HM-2024-004',
        experience_years: 10,
        category_id: finalCategories[0]?.id,
        description: 'Reliable handyman services for home repairs, installations, and maintenance.',
        status: 'approved'
      },
      {
        business_name: 'Luxury Spa & Wellness',
        contact_person: 'Lisa Chen',
        phone: '+1-555-0654',
        email: 'lisa@luxuryspa.com',
        address: '654 Wellness Way, Spa District, City 12349',
        license_number: 'SP-2024-005',
        experience_years: 15,
        category_id: finalCategories[1]?.id,
        description: 'Premium spa services including massages, facials, and wellness treatments.',
        status: 'rejected',
        rejection_reason: 'Incomplete documentation provided'
      }
    ];

    const { data, error } = await supabase
      .from('provider_registration_requests')
      .insert(sampleRequests)
      .select();

    if (error) {
      console.error('Error adding sample requests:', error);
      return;
    }

    console.log('Successfully added sample provider registration requests:');
    console.log(`- ${sampleRequests.length} requests created`);
    console.log('- Mix of pending, approved, and rejected statuses');
    console.log('- Requests distributed across different categories');
    
    // Verify the data was inserted
    const { data: verification, error: verifyError } = await supabase
      .from('provider_registration_requests')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (!verifyError && verification) {
      console.log('\nVerification - Recent requests in database:');
      verification.forEach(req => {
        console.log(`- ${req.business_name} (${req.status}) - ${req.categories?.name}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addSampleRequests();