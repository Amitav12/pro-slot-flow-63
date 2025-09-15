import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function debugRegistration() {
  console.log('Debugging provider registration system...');
  
  try {
    // Check if table exists and structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('provider_registration_requests')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table access error:', tableError);
      return;
    }
    
    console.log('✅ Table accessible');
    
    // Check categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (catError) {
      console.error('Categories error:', catError);
    } else {
      console.log('Available categories:', categories?.length || 0);
      if (categories && categories.length > 0) {
        console.log('Sample categories:', categories.map(c => ({ id: c.id, name: c.name })));
      }
    }
    
    // Check current user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
    } else if (user) {
      console.log('✅ User authenticated:', user.id);
      
      // Try to insert a test registration request
      if (categories && categories.length > 0) {
        console.log('\nAttempting test registration...');
        
        const testData = {
          user_id: user.id,
          category_id: categories[0].id,
          business_name: 'Test Business',
          contact_person: 'Test Person',
          phone: '+1-555-0123',
          email: user.email || 'test@example.com',
          address: '123 Test Street',
          license_number: 'TEST123',
          experience_years: 5,
          description: 'Test registration for debugging',
          status: 'pending'
        };
        
        const { data: insertResult, error: insertError } = await supabase
          .from('provider_registration_requests')
          .insert(testData)
          .select();
        
        if (insertError) {
          console.error('❌ Insert failed:', insertError);
        } else {
          console.log('✅ Test registration created:', insertResult);
          
          // Clean up - delete the test record
          if (insertResult && insertResult.length > 0) {
            await supabase
              .from('provider_registration_requests')
              .delete()
              .eq('id', insertResult[0].id);
            console.log('🧹 Test record cleaned up');
          }
        }
      }
    } else {
      console.log('❌ No user authenticated');
    }
    
    // Check RLS policies
    console.log('\nChecking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'provider_registration_requests';
        `
      });
    
    if (policyError) {
      console.log('Cannot check policies directly (expected in client-side)');
    } else {
      console.log('Policies:', policies);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugRegistration();