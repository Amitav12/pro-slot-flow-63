import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log('🔍 Comprehensive Database Schema Inspector');
console.log('==========================================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCompleteSchema() {
  const schemaInfo = {
    tables: {},
    relationships: [],
    constraints: [],
    indexes: [],
    triggers: [],
    functions: [],
    policies: [],
    metadata: {
      inspectedAt: new Date().toISOString(),
      totalTables: 0,
      totalColumns: 0
    }
  };

  try {
    console.log('📊 Fetching complete database schema...');
    
    // 1. Get all tables in public schema
    console.log('🔍 Discovering tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables');
    
    if (tablesError) {
      // Fallback method - get tables from information_schema
      const { data: fallbackTables, error: fallbackError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
      
      if (fallbackError) {
        console.log('⚠️  Using direct table discovery...');
        // Direct method - try to access known tables
        const knownTables = [
          'user_profiles', 'admin_settings', 'booking_slots', 'bookings', 
          'categories', 'favorites', 'locations', 'notifications', 
          'provider_services', 'service_provider_documents', 'service_providers', 
          'services', 'subcategories'
        ];
        
        for (const tableName of knownTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(0); // Get structure only, no data
            
            if (!error) {
              schemaInfo.tables[tableName] = { exists: true, columns: {} };
            }
          } catch (e) {
            // Table doesn't exist or no access
          }
        }
      } else {
        fallbackTables.forEach(table => {
          schemaInfo.tables[table.table_name] = { exists: true, columns: {} };
        });
      }
    } else {
      tables.forEach(table => {
        schemaInfo.tables[table.table_name] = { exists: true, columns: {} };
      });
    }

    const tableNames = Object.keys(schemaInfo.tables);
    console.log(`✅ Found ${tableNames.length} tables:`, tableNames.join(', '));
    schemaInfo.metadata.totalTables = tableNames.length;

    // 2. Get detailed column information for each table
    console.log('📋 Analyzing table structures...');
    
    for (const tableName of tableNames) {
      try {
        console.log(`  🔍 Inspecting ${tableName}...`);
        
        // Get column information
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_table_columns', { table_name: tableName });
        
        if (columnsError) {
          // Fallback: Try to get columns by selecting from the table
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!sampleError && sampleData && sampleData.length > 0) {
            // Extract column info from sample data
            Object.keys(sampleData[0]).forEach(columnName => {
              schemaInfo.tables[tableName].columns[columnName] = {
                name: columnName,
                type: typeof sampleData[0][columnName],
                nullable: true, // Can't determine from sample
                default: null
              };
            });
          } else if (!sampleError) {
            // Table exists but is empty, try to get schema info differently
            try {
              const { error: schemaError } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', 'non-existent-id'); // This will fail but give us column info
            } catch (e) {
              // Extract column names from error message if possible
            }
          }
        } else {
          // Process column information
          columns.forEach(col => {
            schemaInfo.tables[tableName].columns[col.column_name] = {
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES',
              default: col.column_default,
              maxLength: col.character_maximum_length,
              position: col.ordinal_position
            };
            schemaInfo.metadata.totalColumns++;
          });
        }
        
        // Get primary key information
        try {
          const { data: primaryKeys, error: pkError } = await supabase
            .rpc('get_primary_keys', { table_name: tableName });
          
          if (!pkError && primaryKeys) {
            schemaInfo.tables[tableName].primaryKeys = primaryKeys.map(pk => pk.column_name);
          }
        } catch (e) {
          // Primary key info not available
        }
        
        // Get foreign key relationships
        try {
          const { data: foreignKeys, error: fkError } = await supabase
            .rpc('get_foreign_keys', { table_name: tableName });
          
          if (!fkError && foreignKeys) {
            schemaInfo.tables[tableName].foreignKeys = foreignKeys;
            schemaInfo.relationships.push(...foreignKeys.map(fk => ({
              fromTable: tableName,
              fromColumn: fk.column_name,
              toTable: fk.foreign_table_name,
              toColumn: fk.foreign_column_name,
              constraintName: fk.constraint_name
            })));
          }
        } catch (e) {
          // Foreign key info not available
        }
        
      } catch (error) {
        console.log(`  ⚠️  Could not fully inspect ${tableName}:`, error.message);
        schemaInfo.tables[tableName].error = error.message;
      }
    }

    // 3. Get RLS policies
    console.log('🔒 Checking RLS policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies');
      
      if (!policiesError && policies) {
        schemaInfo.policies = policies;
      }
    } catch (e) {
      console.log('  ⚠️  Could not fetch RLS policies');
    }

    // 4. Get triggers
    console.log('⚡ Checking triggers...');
    try {
      const { data: triggers, error: triggersError } = await supabase
        .rpc('get_triggers');
      
      if (!triggersError && triggers) {
        schemaInfo.triggers = triggers;
      }
    } catch (e) {
      console.log('  ⚠️  Could not fetch triggers');
    }

    // 5. Get functions
    console.log('🔧 Checking functions...');
    try {
      const { data: functions, error: functionsError } = await supabase
        .rpc('get_functions');
      
      if (!functionsError && functions) {
        schemaInfo.functions = functions;
      }
    } catch (e) {
      console.log('  ⚠️  Could not fetch functions');
    }

    // 6. Save complete schema to file
    const schemaJson = JSON.stringify(schemaInfo, null, 2);
    fs.writeFileSync('database-schema-complete.json', schemaJson);
    
    // 7. Generate human-readable report
    generateSchemaReport(schemaInfo);
    
    console.log('');
    console.log('🎉 Schema Inspection Complete!');
    console.log('==============================');
    console.log(`📊 Total Tables: ${schemaInfo.metadata.totalTables}`);
    console.log(`📋 Total Columns: ${schemaInfo.metadata.totalColumns}`);
    console.log(`🔗 Relationships: ${schemaInfo.relationships.length}`);
    console.log(`🔒 RLS Policies: ${schemaInfo.policies.length}`);
    console.log(`⚡ Triggers: ${schemaInfo.triggers.length}`);
    console.log(`🔧 Functions: ${schemaInfo.functions.length}`);
    console.log('');
    console.log('📁 Files Generated:');
    console.log('  • database-schema-complete.json (Complete schema data)');
    console.log('  • database-schema-report.md (Human-readable report)');
    console.log('');
    
    return schemaInfo;
    
  } catch (error) {
    console.error('❌ Error during schema inspection:', error);
    throw error;
  }
}

function generateSchemaReport(schemaInfo) {
  let report = `# Database Schema Report\n\n`;
  report += `**Generated:** ${schemaInfo.metadata.inspectedAt}\n`;
  report += `**Total Tables:** ${schemaInfo.metadata.totalTables}\n`;
  report += `**Total Columns:** ${schemaInfo.metadata.totalColumns}\n\n`;
  
  report += `## Tables Overview\n\n`;
  
  Object.entries(schemaInfo.tables).forEach(([tableName, tableInfo]) => {
    report += `### ${tableName}\n\n`;
    
    if (tableInfo.error) {
      report += `⚠️ **Error:** ${tableInfo.error}\n\n`;
      return;
    }
    
    const columnCount = Object.keys(tableInfo.columns || {}).length;
    report += `**Columns:** ${columnCount}\n\n`;
    
    if (tableInfo.primaryKeys && tableInfo.primaryKeys.length > 0) {
      report += `**Primary Keys:** ${tableInfo.primaryKeys.join(', ')}\n\n`;
    }
    
    if (tableInfo.columns && Object.keys(tableInfo.columns).length > 0) {
      report += `| Column | Type | Nullable | Default |\n`;
      report += `|--------|------|----------|----------|\n`;
      
      Object.values(tableInfo.columns).forEach(col => {
        report += `| ${col.name} | ${col.type} | ${col.nullable ? 'Yes' : 'No'} | ${col.default || 'None'} |\n`;
      });
      report += `\n`;
    }
    
    if (tableInfo.foreignKeys && tableInfo.foreignKeys.length > 0) {
      report += `**Foreign Keys:**\n`;
      tableInfo.foreignKeys.forEach(fk => {
        report += `- ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}\n`;
      });
      report += `\n`;
    }
    
    report += `---\n\n`;
  });
  
  if (schemaInfo.relationships.length > 0) {
    report += `## Relationships\n\n`;
    schemaInfo.relationships.forEach(rel => {
      report += `- **${rel.fromTable}.${rel.fromColumn}** → **${rel.toTable}.${rel.toColumn}**\n`;
    });
    report += `\n`;
  }
  
  if (schemaInfo.policies.length > 0) {
    report += `## RLS Policies\n\n`;
    schemaInfo.policies.forEach(policy => {
      report += `### ${policy.tablename}\n`;
      report += `- **${policy.policyname}**: ${policy.cmd} - ${policy.qual}\n\n`;
    });
  }
  
  if (schemaInfo.triggers.length > 0) {
    report += `## Triggers\n\n`;
    schemaInfo.triggers.forEach(trigger => {
      report += `- **${trigger.trigger_name}** on **${trigger.event_object_table}**\n`;
    });
    report += `\n`;
  }
  
  fs.writeFileSync('database-schema-report.md', report);
}

// Run the inspection
inspectCompleteSchema()
  .then(schema => {
    console.log('✅ Schema inspection completed successfully');
    
    // Now let's specifically check the user_profiles table for the auth issue
    if (schema.tables.user_profiles) {
      console.log('');
      console.log('🔍 Analyzing user_profiles for auth issue...');
      console.log('===========================================');
      
      const userProfilesColumns = Object.keys(schema.tables.user_profiles.columns || {});
      console.log('Current columns:', userProfilesColumns.join(', '));
      
      const requiredColumns = ['auth_role', 'role', 'user_id', 'full_name'];
      const missingColumns = requiredColumns.filter(col => !userProfilesColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing required columns:', missingColumns.join(', '));
        console.log('');
        console.log('📋 SQL to fix missing columns:');
        console.log('==============================');
        missingColumns.forEach(col => {
          if (col === 'auth_role') {
            console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';`);
          } else if (col === 'role') {
            console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';`);
          } else {
            console.log(`ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
          }
        });
        console.log('');
      } else {
        console.log('✅ All required columns are present');
      }
    }
  })
  .catch(error => {
    console.error('❌ Schema inspection failed:', error);
  });