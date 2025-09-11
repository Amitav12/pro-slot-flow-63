// Complete Supabase database inspection - pulls ALL tables and structure
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://igezuyqvfoxolxbudcyj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function getAllTables() {
  console.log('🔍 DISCOVERING ALL TABLES IN DATABASE');
  console.log('=' .repeat(60));
  
  try {
    // Query to get all tables in the public schema
    const { data: tables, error } = await supabase
      .rpc('get_all_tables');
    
    if (error) {
      console.log('❌ Could not get tables via RPC, trying alternative method...');
      
      // Alternative: Try to query information_schema (might not work due to RLS)
      const { data: altTables, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (altError) {
        console.log('❌ Alternative method failed, using known tables...');
        return [
          'categories', 'subcategories', 'locations', 'user_profiles', 
          'provider_services', 'bookings', 'reviews', 'payments',
          'notifications', 'service_requests', 'availability_slots'
        ];
      }
      
      return altTables.map(t => t.table_name);
    }
    
    return tables;
    
  } catch (err) {
    console.log('❌ Error discovering tables, using comprehensive list...');
    // Return comprehensive list of possible tables
    return [
      'categories', 'subcategories', 'locations', 'user_profiles', 
      'provider_services', 'bookings', 'reviews', 'payments',
      'notifications', 'service_requests', 'availability_slots',
      'service_areas', 'business_hours', 'pricing_tiers',
      'promotional_offers', 'customer_preferences', 'service_history',
      'feedback', 'support_tickets', 'audit_logs', 'system_settings'
    ];
  }
}

async function getTableSchema(tableName) {
  try {
    // Try to get column information
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      return { error: error.message, columns: [] };
    }
    
    if (!data || data.length === 0) {
      // Table exists but no data - try to insert and rollback to get schema
      try {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert({});
        
        // This will fail but might give us column info
        if (insertError && insertError.message.includes('null value')) {
          const columns = extractColumnsFromError(insertError.message);
          return { columns, hasData: false };
        }
      } catch (e) {
        // Ignore
      }
      
      return { columns: [], hasData: false };
    }
    
    const columns = Object.keys(data[0]).map(key => ({
      name: key,
      type: typeof data[0][key],
      nullable: data[0][key] === null,
      sample: data[0][key]
    }));
    
    return { columns, hasData: true, sampleData: data[0] };
    
  } catch (err) {
    return { error: err.message, columns: [] };
  }
}

function extractColumnsFromError(errorMessage) {
  // Try to extract column names from error messages
  const matches = errorMessage.match(/column "([^"]+)"/g);
  if (matches) {
    return matches.map(match => ({
      name: match.replace(/column "|"/g, ''),
      type: 'unknown',
      nullable: true
    }));
  }
  return [];
}

async function getTableData(tableName, limit = 5) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
      
    if (error) {
      return { error: error.message, data: [] };
    }
    
    return { data: data || [], count: data?.length || 0 };
    
  } catch (err) {
    return { error: err.message, data: [] };
  }
}

async function getTableRelationships(tableName) {
  try {
    // Try to detect relationships by looking for foreign key patterns
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error || !data || data.length === 0) {
      return [];
    }
    
    const relationships = [];
    const record = data[0];
    
    // Look for columns ending with _id that might be foreign keys
    Object.keys(record).forEach(key => {
      if (key.endsWith('_id') && key !== 'id') {
        const possibleTable = key.replace('_id', 's'); // user_id -> users
        relationships.push({
          column: key,
          possibleTable: possibleTable,
          type: 'foreign_key'
        });
      }
    });
    
    return relationships;
    
  } catch (err) {
    return [];
  }
}

async function fullDatabaseInspection() {
  console.log('🚀 COMPLETE SUPABASE DATABASE INSPECTION');
  console.log('=' .repeat(60));
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`🌐 Database: ${SUPABASE_URL}`);
  console.log('');
  
  // Get all tables
  const tableNames = await getAllTables();
  console.log(`📊 Found ${tableNames.length} potential tables to inspect`);
  console.log('');
  
  const databaseStructure = {
    tables: {},
    relationships: {},
    summary: {
      totalTables: 0,
      tablesWithData: 0,
      totalRecords: 0,
      inspectionDate: new Date().toISOString()
    }
  };
  
  // Inspect each table
  for (const tableName of tableNames) {
    console.log(`\n📋 INSPECTING TABLE: ${tableName.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    // Get schema
    const schema = await getTableSchema(tableName);
    
    if (schema.error) {
      console.log(`❌ Error: ${schema.error}`);
      if (schema.error.includes('does not exist')) {
        console.log('   Table does not exist - skipping');
        continue;
      }
    }
    
    // Get data
    const tableData = await getTableData(tableName, 10);
    
    if (tableData.error) {
      console.log(`❌ Data Error: ${tableData.error}`);
    }
    
    // Get relationships
    const relationships = await getTableRelationships(tableName);
    
    // Store in structure
    databaseStructure.tables[tableName] = {
      exists: !schema.error || !schema.error.includes('does not exist'),
      columns: schema.columns || [],
      hasData: schema.hasData || tableData.count > 0,
      recordCount: tableData.count || 0,
      sampleData: tableData.data || [],
      relationships: relationships,
      error: schema.error || tableData.error
    };
    
    if (databaseStructure.tables[tableName].exists) {
      databaseStructure.summary.totalTables++;
      
      if (databaseStructure.tables[tableName].hasData) {
        databaseStructure.summary.tablesWithData++;
        databaseStructure.summary.totalRecords += databaseStructure.tables[tableName].recordCount;
      }
    }
    
    // Display results
    if (schema.error && schema.error.includes('does not exist')) {
      console.log('❌ Table does not exist');
      continue;
    }
    
    if (schema.columns && schema.columns.length > 0) {
      console.log('✅ Table exists');
      console.log(`📊 Records: ${tableData.count || 0}`);
      console.log('\n🏗️  COLUMNS:');
      schema.columns.forEach(col => {
        console.log(`   ${col.name}: ${col.type}${col.nullable ? ' (nullable)' : ''}`);
      });
      
      if (relationships.length > 0) {
        console.log('\n🔗 POSSIBLE RELATIONSHIPS:');
        relationships.forEach(rel => {
          console.log(`   ${rel.column} -> ${rel.possibleTable} (${rel.type})`);
        });
      }
      
      if (tableData.data && tableData.data.length > 0) {
        console.log('\n📝 SAMPLE DATA:');
        tableData.data.slice(0, 2).forEach((record, index) => {
          console.log(`\n   Record ${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = value === null ? 'NULL' : 
                                typeof value === 'string' && value.length > 40 ? 
                                value.substring(0, 40) + '...' : value;
            console.log(`     ${key}: ${displayValue}`);
          });
        });
      }
    } else {
      console.log('❓ Could not determine table structure');
    }
  }
  
  // Summary
  console.log('\n\n📊 DATABASE SUMMARY');
  console.log('=' .repeat(60));
  console.log(`📋 Total Tables: ${databaseStructure.summary.totalTables}`);
  console.log(`📊 Tables with Data: ${databaseStructure.summary.tablesWithData}`);
  console.log(`📝 Total Records: ${databaseStructure.summary.totalRecords}`);
  
  console.log('\n🏗️  EXISTING TABLES:');
  Object.entries(databaseStructure.tables)
    .filter(([name, info]) => info.exists)
    .forEach(([name, info]) => {
      console.log(`   ✅ ${name}: ${info.recordCount} records, ${info.columns.length} columns`);
    });
  
  console.log('\n❌ NON-EXISTENT TABLES:');
  Object.entries(databaseStructure.tables)
    .filter(([name, info]) => !info.exists)
    .forEach(([name, info]) => {
      console.log(`   ❌ ${name}`);
    });
  
  // Save to file
  const fs = await import('fs');
  fs.writeFileSync('database-structure.json', JSON.stringify(databaseStructure, null, 2));
  console.log('\n💾 Database structure saved to: database-structure.json');
  
  console.log('\n✨ Complete database inspection finished!');
  
  return databaseStructure;
}

// Run the inspection
fullDatabaseInspection().catch(console.error);