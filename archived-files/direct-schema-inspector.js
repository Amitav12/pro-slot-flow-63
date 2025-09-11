import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log('🔍 Direct Database Schema Inspector');
console.log('===================================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabaseDirect() {
  const schemaInfo = {
    tables: {},
    inspectedAt: new Date().toISOString(),
    authIssueAnalysis: {}
  };

  // Known tables from your screenshot
  const knownTables = [
    'admin_settings',
    'booking_slots', 
    'bookings',
    'categories',
    'favorites',
    'locations',
    'notifications',
    'provider_services',
    'service_provider_documents',
    'service_providers',
    'services',
    'subcategories',
    'user_profiles'
  ];

  console.log('📊 Inspecting database tables...');
  console.log(`🔍 Checking ${knownTables.length} known tables...`);

  for (const tableName of knownTables) {
    console.log(`  📋 Analyzing ${tableName}...`);
    
    try {
      // Try to get table structure by selecting with limit 0
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        schemaInfo.tables[tableName] = {
          exists: false,
          error: error.message
        };
        console.log(`    ❌ ${tableName}: ${error.message}`);
        continue;
      }

      // Table exists, now get column information
      schemaInfo.tables[tableName] = {
        exists: true,
        columns: {},
        sampleData: data && data.length > 0 ? data[0] : null
      };

      // If we have sample data, extract column types
      if (data && data.length > 0) {
        const sample = data[0];
        Object.entries(sample).forEach(([columnName, value]) => {
          schemaInfo.tables[tableName].columns[columnName] = {
            name: columnName,
            type: typeof value,
            sampleValue: value,
            isNull: value === null
          };
        });
        console.log(`    ✅ ${tableName}: ${Object.keys(sample).length} columns`);
      } else {
        // Table exists but is empty, try to get schema info differently
        console.log(`    ✅ ${tableName}: exists (empty)`);
        
        // Try to insert a test record to see what columns are expected
        try {
          const { error: insertError } = await supabase
            .from(tableName)
            .insert({});
          
          if (insertError) {
            // Parse error message to extract column information
            const errorMsg = insertError.message;
            if (errorMsg.includes('null value in column')) {
              const match = errorMsg.match(/null value in column "([^"]+)"/);
              if (match) {
                schemaInfo.tables[tableName].requiredColumns = [match[1]];
              }
            }
          }
        } catch (e) {
          // Ignore insert errors, we're just probing
        }
      }

    } catch (error) {
      schemaInfo.tables[tableName] = {
        exists: false,
        error: error.message
      };
      console.log(`    ❌ ${tableName}: ${error.message}`);
    }
  }

  // Special analysis for user_profiles table (the one causing auth issues)
  console.log('');
  console.log('🔍 Special Analysis: user_profiles table');
  console.log('========================================');

  if (schemaInfo.tables.user_profiles && schemaInfo.tables.user_profiles.exists) {
    const userProfiles = schemaInfo.tables.user_profiles;
    
    console.log('✅ user_profiles table exists');
    
    if (userProfiles.columns && Object.keys(userProfiles.columns).length > 0) {
      const columns = Object.keys(userProfiles.columns);
      console.log('📋 Current columns:', columns.join(', '));
      
      // Check for required auth columns
      const requiredAuthColumns = ['auth_role', 'role', 'user_id', 'full_name'];
      const missingColumns = requiredAuthColumns.filter(col => !columns.includes(col));
      
      schemaInfo.authIssueAnalysis = {
        hasUserProfilesTable: true,
        currentColumns: columns,
        requiredColumns: requiredAuthColumns,
        missingColumns: missingColumns,
        isAuthReady: missingColumns.length === 0
      };
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing required columns for auth:', missingColumns.join(', '));
        console.log('');
        console.log('📋 SQL to fix the auth issue:');
        console.log('=============================');
        
        missingColumns.forEach(col => {
          switch(col) {
            case 'auth_role':
              console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';`);
              break;
            case 'role':
              console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';`);
              break;
            case 'user_id':
              console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;`);
              break;
            case 'full_name':
              console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;`);
              break;
            default:
              console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
          }
        });
        
        console.log('');
        console.log('After running the above SQL, also run:');
        console.log('UPDATE public.user_profiles SET auth_role = role WHERE auth_role IS NULL;');
        console.log('UPDATE public.user_profiles SET role = \'customer\' WHERE role IS NULL;');
        
      } else {
        console.log('✅ All required auth columns are present');
        schemaInfo.authIssueAnalysis.diagnosis = 'Columns are correct. Issue might be in triggers or RLS policies.';
      }
      
    } else {
      console.log('⚠️  Could not determine column structure (table might be empty)');
      schemaInfo.authIssueAnalysis = {
        hasUserProfilesTable: true,
        currentColumns: [],
        diagnosis: 'Table exists but column structure could not be determined'
      };
    }
    
    // Test basic operations
    console.log('');
    console.log('🧪 Testing basic operations...');
    
    // Test SELECT
    try {
      const { data: selectTest, error: selectError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log('❌ SELECT test failed:', selectError.message);
        schemaInfo.authIssueAnalysis.selectWorks = false;
        schemaInfo.authIssueAnalysis.selectError = selectError.message;
      } else {
        console.log('✅ SELECT works');
        schemaInfo.authIssueAnalysis.selectWorks = true;
      }
    } catch (e) {
      console.log('❌ SELECT test error:', e.message);
    }
    
    // Test INSERT (with a safe test)
    try {
      const testUserId = '00000000-0000-0000-0000-000000000001';
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: testUserId,
          full_name: 'Test User',
          role: 'customer'
        });
      
      if (insertError) {
        console.log('❌ INSERT test failed:', insertError.message);
        schemaInfo.authIssueAnalysis.insertWorks = false;
        schemaInfo.authIssueAnalysis.insertError = insertError.message;
        
        // Check if it's an auth_role issue
        if (insertError.message.includes('auth_role')) {
          console.log('🎯 FOUND THE ISSUE: auth_role column is missing or has constraints');
        }
      } else {
        console.log('✅ INSERT works');
        schemaInfo.authIssueAnalysis.insertWorks = true;
        
        // Clean up test record
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', testUserId);
      }
    } catch (e) {
      console.log('❌ INSERT test error:', e.message);
    }
    
  } else {
    console.log('❌ user_profiles table does not exist or is not accessible');
    schemaInfo.authIssueAnalysis = {
      hasUserProfilesTable: false,
      diagnosis: 'user_profiles table is missing - this is the root cause of the auth loading issue'
    };
  }

  // Save results
  const schemaJson = JSON.stringify(schemaInfo, null, 2);
  fs.writeFileSync('database-schema-direct.json', schemaJson);
  
  // Generate fix script
  generateAuthFixScript(schemaInfo);
  
  console.log('');
  console.log('🎉 Direct Schema Inspection Complete!');
  console.log('=====================================');
  console.log(`📊 Tables found: ${Object.keys(schemaInfo.tables).filter(t => schemaInfo.tables[t].exists).length}`);
  console.log(`❌ Tables with issues: ${Object.keys(schemaInfo.tables).filter(t => !schemaInfo.tables[t].exists).length}`);
  console.log('');
  console.log('📁 Files generated:');
  console.log('  • database-schema-direct.json (Complete inspection results)');
  console.log('  • auth-fix-script.sql (SQL to fix the auth loading issue)');
  console.log('');
  
  return schemaInfo;
}

function generateAuthFixScript(schemaInfo) {
  let fixScript = `-- Auto-generated fix for authentication loading issue\n`;
  fixScript += `-- Generated: ${schemaInfo.inspectedAt}\n\n`;
  
  if (!schemaInfo.authIssueAnalysis.hasUserProfilesTable) {
    fixScript += `-- ERROR: user_profiles table does not exist\n`;
    fixScript += `-- You need to run the complete database setup first\n`;
    fixScript += `-- Please run: 4-persona-auth-system.sql\n\n`;
  } else if (schemaInfo.authIssueAnalysis.missingColumns && schemaInfo.authIssueAnalysis.missingColumns.length > 0) {
    fixScript += `-- Fix missing columns in user_profiles table\n\n`;
    
    schemaInfo.authIssueAnalysis.missingColumns.forEach(col => {
      switch(col) {
        case 'auth_role':
          fixScript += `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';\n`;
          break;
        case 'role':
          fixScript += `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';\n`;
          break;
        case 'user_id':
          fixScript += `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;\n`;
          break;
        case 'full_name':
          fixScript += `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;\n`;
          break;
        default:
          fixScript += `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS ${col} TEXT;\n`;
      }
    });
    
    fixScript += `\n-- Update existing records\n`;
    fixScript += `UPDATE public.user_profiles SET auth_role = COALESCE(role, 'customer') WHERE auth_role IS NULL;\n`;
    fixScript += `UPDATE public.user_profiles SET role = 'customer' WHERE role IS NULL;\n\n`;
  } else {
    fixScript += `-- user_profiles table structure looks correct\n`;
    fixScript += `-- The issue might be in RLS policies or triggers\n\n`;
    
    if (schemaInfo.authIssueAnalysis.insertError) {
      fixScript += `-- INSERT error detected: ${schemaInfo.authIssueAnalysis.insertError}\n`;
      fixScript += `-- This suggests RLS policy issues\n\n`;
      
      fixScript += `-- Fix RLS policies\n`;
      fixScript += `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;\n\n`;
      fixScript += `-- Drop and recreate policies\n`;
      fixScript += `DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;\n`;
      fixScript += `DROP POLICY IF EXISTS "Enable insert for service role" ON public.user_profiles;\n`;
      fixScript += `DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.user_profiles;\n\n`;
      fixScript += `CREATE POLICY "Users can manage own profile" ON public.user_profiles\n`;
      fixScript += `  FOR ALL USING (auth.uid() = user_id);\n\n`;
      fixScript += `CREATE POLICY "Enable insert for service role" ON public.user_profiles\n`;
      fixScript += `  FOR INSERT WITH CHECK (true);\n\n`;
      fixScript += `CREATE POLICY "Enable read for authenticated users" ON public.user_profiles\n`;
      fixScript += `  FOR SELECT USING (auth.role() = 'authenticated');\n\n`;
    }
  }
  
  fixScript += `-- Ensure trigger function exists\n`;
  fixScript += `CREATE OR REPLACE FUNCTION public.handle_new_user()\n`;
  fixScript += `RETURNS TRIGGER\n`;
  fixScript += `LANGUAGE plpgsql\n`;
  fixScript += `SECURITY DEFINER SET search_path = public\n`;
  fixScript += `AS $$\n`;
  fixScript += `BEGIN\n`;
  fixScript += `  INSERT INTO public.user_profiles (\n`;
  fixScript += `    user_id,\n`;
  fixScript += `    full_name,\n`;
  fixScript += `    role,\n`;
  fixScript += `    auth_role,\n`;
  fixScript += `    registration_status,\n`;
  fixScript += `    onboarding_completed\n`;
  fixScript += `  ) VALUES (\n`;
  fixScript += `    NEW.id,\n`;
  fixScript += `    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),\n`;
  fixScript += `    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),\n`;
  fixScript += `    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),\n`;
  fixScript += `    'approved',\n`;
  fixScript += `    false\n`;
  fixScript += `  );\n`;
  fixScript += `  RETURN NEW;\n`;
  fixScript += `EXCEPTION\n`;
  fixScript += `  WHEN OTHERS THEN\n`;
  fixScript += `    RAISE WARNING 'Failed to create user profile: %', SQLERRM;\n`;
  fixScript += `    RETURN NEW;\n`;
  fixScript += `END;\n`;
  fixScript += `$$;\n\n`;
  fixScript += `-- Create trigger\n`;
  fixScript += `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;\n`;
  fixScript += `CREATE TRIGGER on_auth_user_created\n`;
  fixScript += `  AFTER INSERT ON auth.users\n`;
  fixScript += `  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();\n\n`;
  fixScript += `-- Success message\n`;
  fixScript += `DO $$\n`;
  fixScript += `BEGIN\n`;
  fixScript += `  RAISE NOTICE 'Authentication loading issue should now be fixed!';\n`;
  fixScript += `END $$;\n`;
  
  fs.writeFileSync('auth-fix-script.sql', fixScript);
}

// Run the inspection
inspectDatabaseDirect()
  .then(schema => {
    console.log('✅ Inspection completed successfully');
    
    if (schema.authIssueAnalysis.isAuthReady) {
      console.log('🎉 Your database appears to be ready for authentication!');
    } else {
      console.log('🔧 Run the generated auth-fix-script.sql to resolve the authentication loading issue');
    }
  })
  .catch(error => {
    console.error('❌ Inspection failed:', error);
  });