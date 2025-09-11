import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPolicyFix() {
  console.log('🔧 Running RLS policy fixes...\n');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./fix-policies.sql', 'utf8');
    
    // Split into individual statements (rough split by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('DO $'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`⚡ Executing statement ${i + 1}...`);
        console.log(`   ${statement.substring(0, 60)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} result: ${error.message}`);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 Policy fix completed!');
    console.log('🔍 Testing table access...\n');
    
    // Test table access
    const tables = ['categories', 'subcategories', 'locations', 'user_profiles'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible (${data?.length || 0} records tested)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error running policy fix:', error.message);
  }
}

runPolicyFix();