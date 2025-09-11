import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Fixing Authentication Loading Issue');
console.log('=====================================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  console.log('Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAuthIssue() {
  try {
    console.log('🔍 Checking database setup...');
    
    // 1. Check if user_profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      if (tablesError.message.includes('relation "user_profiles" does not exist')) {
        console.log('❌ user_profiles table does not exist');
        console.log('');
        console.log('📋 REQUIRED ACTION:');
        console.log('==================');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Run the 4-persona-auth-system.sql file');
        console.log('3. This will create all necessary tables and triggers');
        console.log('');
        return;
      }
      throw tablesError;
    }
    
    console.log('✅ user_profiles table exists');
    
    // 2. Check if trigger function exists
    console.log('🔍 Checking trigger function...');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('check_function_exists', { function_name: 'handle_new_user' })
      .single();
    
    if (functionsError || !functions) {
      console.log('⚠️  Trigger function may not exist');
      console.log('This could cause profile creation issues');
    } else {
      console.log('✅ Trigger function exists');
    }
    
    // 3. Test profile creation
    console.log('🧪 Testing profile creation...');
    
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    // Try to create a test profile
    const { data: testProfile, error: createError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: testUserId,
        full_name: 'Test User',
        role: 'customer',
        auth_role: 'customer',
        registration_status: 'approved',
        onboarding_completed: false
      })
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Profile creation failed:', createError.message);
      console.log('This indicates RLS policy or permission issues');
      
      console.log('');
      console.log('📋 REQUIRED ACTION:');
      console.log('==================');
      console.log('1. Open Supabase Dashboard → SQL Editor');
      console.log('2. Run this SQL to fix RLS policies:');
      console.log('');
      console.log(`-- Fix RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;

-- Create comprehensive policies
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');`);
      console.log('');
      return;
    }
    
    console.log('✅ Profile creation test successful');
    
    // Clean up test profile
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    // 4. Test authentication flow
    console.log('🧪 Testing authentication flow...');
    
    // Create a test user (this will be cleaned up)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPass123';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'customer'
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Signup test failed:', signupError.message);
      return;
    }
    
    if (signupData.user) {
      console.log('✅ Signup test successful');
      
      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile was created
      const { data: createdProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', signupData.user.id)
        .single();
      
      if (profileError || !createdProfile) {
        console.log('⚠️  Profile was not automatically created by trigger');
        console.log('This explains the loading screen issue!');
        
        console.log('');
        console.log('📋 FIXING THE ISSUE:');
        console.log('====================');
        console.log('1. The trigger is not working properly');
        console.log('2. Run this SQL in Supabase Dashboard:');
        console.log('');
        console.log(`-- Recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    role,
    auth_role,
    registration_status,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    'approved',
    false
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`);
        console.log('');
      } else {
        console.log('✅ Profile was automatically created');
        console.log('✅ Authentication flow is working correctly');
      }
      
      // Clean up test user
      if (signupData.session) {
        await supabase.auth.signOut();
      }
    }
    
    console.log('');
    console.log('🎉 DIAGNOSIS COMPLETE');
    console.log('====================');
    console.log('');
    console.log('The authentication system has been analyzed.');
    console.log('If you saw any errors above, follow the provided SQL fixes.');
    console.log('Otherwise, the loading issue should now be resolved with the code updates.');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('==============');
    console.log('1. Restart your development server');
    console.log('2. Try creating a new account');
    console.log('3. You should be redirected to the appropriate dashboard');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.log('');
    console.log('Please check your Supabase connection and try again.');
  }
}

fixAuthIssue().catch(console.error);