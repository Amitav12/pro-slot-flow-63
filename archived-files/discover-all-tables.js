// Discover ALL tables in Supabase database using multiple methods
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://igezuyqvfoxolxbudcyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function discoverAllTables() {
  console.log('🔍 DISCOVERING ALL 13 TABLES IN YOUR SUPABASE DATABASE');
  console.log('=' .repeat(60));
  
  // Method 1: Try common table names based on service platform patterns
  const commonTables = [
    'categories', 'subcategories', 'locations', 'user_profiles', 'provider_services',
    'bookings', 'reviews', 'payments', 'notifications', 'service_requests', 
    'availability_slots', 'service_areas', 'business_hours', 'pricing_tiers',
    'promotional_offers', 'customer_preferences', 'service_history',
    'feedback', 'support_tickets', 'audit_logs', 'system_settings',
    'chat_messages', 'file_uploads', 'email_templates', 'sms_templates',
    'push_notifications', 'user_sessions', 'api_keys', 'webhooks',
    'integrations', 'reports', 'analytics', 'feature_flags'
  ];
  
  const existingTables = [];
  const tableDetails = {};
  
  console.log('🔍 Testing table existence...\n');
  
  for (const tableName of commonTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error) {
        existingTables.push(tableName);
        tableDetails[tableName] = {
          exists: true,
          hasData: data && data.length > 0,
          recordCount: data ? data.length : 0,
          firstRecord: data && data.length > 0 ? data[0] : null
        };
        
        console.log(`✅ ${tableName} - ${data ? data.length : 0} records`);
      } else if (!error.message.includes('does not exist') && !error.message.includes('schema cache')) {
        // Table exists but has access issues
        existingTables.push(tableName);
        tableDetails[tableName] = {
          exists: true,
          hasData: false,
          error: error.message
        };
        console.log(`⚠️  ${tableName} - exists but access limited: ${error.message}`);
      }
    } catch (err) {
      // Table doesn't exist or other error
    }
  }
  
  console.log(`\n📊 FOUND ${existingTables.length} TABLES:`);
  console.log('=' .repeat(40));
  
  existingTables.forEach((table, index) => {
    const details = tableDetails[table];
    console.log(`${index + 1}. ${table} ${details.hasData ? `(${details.recordCount} records)` : '(empty)'}`);
  });
  
  if (existingTables.length < 13) {
    console.log(`\n⚠️  Expected 13 tables but found ${existingTables.length}`);
    console.log('🔍 Let me try some additional table name patterns...\n');
    
    // Try additional patterns
    const additionalPatterns = [
      'orders', 'transactions', 'invoices', 'receipts', 'refunds',
      'discounts', 'coupons', 'loyalty_points', 'referrals',
      'subscriptions', 'plans', 'billing', 'taxes', 'shipping',
      'inventory', 'products', 'services', 'packages', 'bundles',
      'schedules', 'appointments', 'calendar_events', 'time_slots',
      'working_hours', 'holidays', 'blackout_dates',
      'user_roles', 'permissions', 'access_logs', 'login_attempts',
      'password_resets', 'email_verifications', 'phone_verifications',
      'social_logins', 'oauth_tokens', 'refresh_tokens',
      'media_files', 'documents', 'images', 'videos', 'attachments',
      'tags', 'categories_tags', 'user_tags', 'content_tags',
      'search_history', 'view_history', 'activity_logs',
      'performance_metrics', 'error_logs', 'debug_logs'
    ];
    
    for (const tableName of additionalPatterns) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
          console.log(`✅ FOUND ADDITIONAL: ${tableName}`);
        }
      } catch (err) {
        // Continue
      }
    }
  }
  
  console.log(`\n🎯 FINAL COUNT: ${existingTables.length} tables discovered`);
  
  if (existingTables.length === 13) {
    console.log('🎉 Perfect! Found all 13 tables!');
  } else if (existingTables.length < 13) {
    console.log(`❓ Still missing ${13 - existingTables.length} tables`);
    console.log('💡 Can you check your Supabase dashboard and tell me the exact table names?');
  } else {
    console.log(`📊 Found more than expected: ${existingTables.length} tables`);
  }
  
  return { existingTables, tableDetails };
}

// Now let's get detailed info for each discovered table
async function getDetailedTableInfo(tableNames) {
  console.log('\n\n🔍 GETTING DETAILED INFO FOR ALL TABLES');
  console.log('=' .repeat(60));
  
  const detailedInfo = {};
  
  for (const tableName of tableNames) {
    console.log(`\n📋 ${tableName.toUpperCase()}`);
    console.log('─'.repeat(30));
    
    try {
      // Get sample data to understand structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        detailedInfo[tableName] = { error: error.message };
        continue;
      }
      
      const recordCount = data ? data.length : 0;
      console.log(`📊 Sample records: ${recordCount}`);
      
      if (recordCount > 0) {
        const columns = Object.keys(data[0]);
        console.log(`🏗️  Columns (${columns.length}): ${columns.join(', ')}`);
        
        // Show first record structure
        console.log('\n📝 Sample record:');
        Object.entries(data[0]).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              typeof value === 'string' && value.length > 30 ? 
                              value.substring(0, 30) + '...' : value;
          console.log(`   ${key}: ${displayValue} (${typeof value})`);
        });
        
        detailedInfo[tableName] = {
          columns,
          sampleData: data,
          recordCount
        };
      } else {
        console.log('📭 No data in table');
        detailedInfo[tableName] = { empty: true };
      }
      
    } catch (err) {
      console.log(`❌ Error inspecting ${tableName}: ${err.message}`);
      detailedInfo[tableName] = { error: err.message };
    }
  }
  
  return detailedInfo;
}

async function main() {
  const { existingTables, tableDetails } = await discoverAllTables();
  const detailedInfo = await getDetailedTableInfo(existingTables);
  
  // Save complete database structure
  const completeStructure = {
    discoveredAt: new Date().toISOString(),
    totalTables: existingTables.length,
    expectedTables: 13,
    tables: existingTables,
    tableDetails: detailedInfo,
    summary: tableDetails
  };
  
  const fs = await import('fs');
  fs.writeFileSync('complete-database-structure.json', JSON.stringify(completeStructure, null, 2));
  
  console.log('\n💾 Complete database structure saved to: complete-database-structure.json');
  console.log('\n✨ Discovery complete!');
  
  return completeStructure;
}

main().catch(console.error);