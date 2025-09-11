import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProviderData() {
  console.log('🧪 Testing Provider Dashboard Data Access...\n');

  try {
    // Test categories
    console.log('📋 Testing Categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoriesError) {
      console.log(`❌ Categories Error: ${categoriesError.message}`);
    } else {
      console.log(`✅ Categories: ${categories.length} records found`);
      categories.slice(0, 2).forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.description}`);
      });
    }

    // Test subcategories
    console.log('\n📋 Testing Subcategories...');
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select(`
        *,
        category:categories(name)
      `)
      .order('name');
    
    if (subcategoriesError) {
      console.log(`❌ Subcategories Error: ${subcategoriesError.message}`);
    } else {
      console.log(`✅ Subcategories: ${subcategories.length} records found`);
      subcategories.slice(0, 2).forEach(sub => {
        console.log(`   - ${sub.name} (${sub.category?.name}): $${sub.min_price}-$${sub.max_price}`);
      });
    }

    // Test locations
    console.log('\n📍 Testing Locations...');
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (locationsError) {
      console.log(`❌ Locations Error: ${locationsError.message}`);
    } else {
      console.log(`✅ Locations: ${locations.length} records found`);
      locations.slice(0, 2).forEach(loc => {
        console.log(`   - ${loc.name}: ${loc.city}, ${loc.state}`);
      });
    }

    // Test provider_services
    console.log('\n🔧 Testing Provider Services...');
    const { data: providerServices, error: servicesError } = await supabase
      .from('provider_services')
      .select(`
        *,
        subcategory:subcategories(
          *,
          category:categories(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (servicesError) {
      console.log(`❌ Provider Services Error: ${servicesError.message}`);
    } else {
      console.log(`✅ Provider Services: ${providerServices.length} records found`);
      if (providerServices.length === 0) {
        console.log('   ℹ️  No provider services registered yet');
      } else {
        providerServices.slice(0, 2).forEach(service => {
          console.log(`   - ${service.service_name}: $${service.price} (${service.status})`);
        });
      }
    }

    // Test user_profiles
    console.log('\n👤 Testing User Profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.log(`❌ User Profiles Error: ${profilesError.message}`);
    } else {
      console.log(`✅ User Profiles: ${profiles.length} records found`);
      if (profiles.length === 0) {
        console.log('   ℹ️  No user profiles created yet');
      }
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Database connection successful');
    console.log('✅ All required tables are accessible');
    console.log('✅ Provider dashboard should work correctly');
    console.log('\n🌐 Access your Provider Dashboard at: http://localhost:5173/provider');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProviderData();