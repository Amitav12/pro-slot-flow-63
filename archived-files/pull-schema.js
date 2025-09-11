import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://igezuyqvfoxolxbudcyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZXp1eXF2Zm94b2x4YnVkY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDQxMjEsImV4cCI6MjA3MjMyMDEyMX0._sdAdEEH2aH_qnzXF1uhHq8_3-BrxNx6IpTLTb-WNHc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function pullSchema() {
  console.log('🔄 Pulling schema from Supabase...\n');

  try {
    // Get all tables and their structure
    const tables = ['categories', 'subcategories', 'locations', 'user_profiles', 'provider_services'];
    const schemaInfo = {};

    for (const tableName of tables) {
      console.log(`📋 Analyzing table: ${tableName}`);
      
      try {
        // Get table structure by querying with limit 0
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          schemaInfo[tableName] = { error: error.message };
        } else {
          console.log(`   ✅ Accessible`);
          
          // Get sample data to understand structure
          const { data: sampleData } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          schemaInfo[tableName] = {
            accessible: true,
            sampleStructure: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
            recordCount: data ? data.length : 0
          };
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        schemaInfo[tableName] = { error: err.message };
      }
    }

    // Generate TypeScript types based on what we know
    const typeDefinitions = generateTypeDefinitions(schemaInfo);
    
    // Write to file
    fs.writeFileSync('src/types/database-schema.ts', typeDefinitions);
    
    // Write schema info as JSON
    fs.writeFileSync('schema-info.json', JSON.stringify(schemaInfo, null, 2));

    console.log('\n✅ Schema information pulled successfully!');
    console.log('📁 Files created:');
    console.log('   - src/types/database-schema.ts (TypeScript types)');
    console.log('   - schema-info.json (Schema information)');

  } catch (error) {
    console.error('❌ Failed to pull schema:', error.message);
  }
}

function generateTypeDefinitions(schemaInfo) {
  let types = `// Generated schema types from Supabase
// Generated on: ${new Date().toISOString()}

export interface Database {
  public: {
    Tables: {
`;

  // Generate types for each table
  Object.entries(schemaInfo).forEach(([tableName, info]) => {
    if (info.accessible && info.sampleStructure) {
      types += `      ${tableName}: {
        Row: {
`;
      // Add basic field types (we'll use string for most since we can't determine exact types)
      info.sampleStructure.forEach(field => {
        types += `          ${field}: string | null;\n`;
      });
      
      types += `        };
        Insert: {
`;
      info.sampleStructure.forEach(field => {
        types += `          ${field}?: string | null;\n`;
      });
      
      types += `        };
        Update: {
`;
      info.sampleStructure.forEach(field => {
        types += `          ${field}?: string | null;\n`;
      });
      
      types += `        };
      };
`;
    }
  });

  types += `    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}`;

  return types;
}

pullSchema();