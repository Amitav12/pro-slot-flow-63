-- Create helper functions for comprehensive schema inspection
-- Run this in Supabase Dashboard → SQL Editor

-- Function to get all tables in public schema
CREATE OR REPLACE FUNCTION get_schema_tables()
RETURNS TABLE(table_name TEXT, table_type TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT t.table_name::TEXT, t.table_type::TEXT
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
$$;

-- Function to get column information for a specific table
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT,
  character_maximum_length INTEGER,
  ordinal_position INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT,
    c.character_maximum_length,
    c.ordinal_position
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = $1
  ORDER BY c.ordinal_position;
$$;

-- Function to get primary keys for a table
CREATE OR REPLACE FUNCTION get_primary_keys(table_name TEXT)
RETURNS TABLE(column_name TEXT, constraint_name TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    kcu.column_name::TEXT,
    tc.constraint_name::TEXT
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = $1;
$$;

-- Function to get foreign keys for a table
CREATE OR REPLACE FUNCTION get_foreign_keys(table_name TEXT)
RETURNS TABLE(
  column_name TEXT,
  constraint_name TEXT,
  foreign_table_name TEXT,
  foreign_column_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    kcu.column_name::TEXT,
    kcu.constraint_name::TEXT,
    ccu.table_name::TEXT AS foreign_table_name,
    ccu.column_name::TEXT AS foreign_column_name
  FROM information_schema.key_column_usage kcu
  JOIN information_schema.constraint_column_usage ccu
    ON kcu.constraint_name = ccu.constraint_name
  JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.table_schema = 'public'
    AND kcu.table_name = $1;
$$;

-- Function to get RLS policies
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE(
  schemaname TEXT,
  tablename TEXT,
  policyname TEXT,
  permissive TEXT,
  roles TEXT[],
  cmd TEXT,
  qual TEXT,
  with_check TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    policyname::TEXT,
    permissive::TEXT,
    roles,
    cmd::TEXT,
    qual::TEXT,
    with_check::TEXT
  FROM pg_policies
  WHERE schemaname = 'public';
$$;

-- Function to get triggers
CREATE OR REPLACE FUNCTION get_triggers()
RETURNS TABLE(
  trigger_name TEXT,
  event_manipulation TEXT,
  event_object_table TEXT,
  action_statement TEXT,
  action_timing TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    trigger_name::TEXT,
    event_manipulation::TEXT,
    event_object_table::TEXT,
    action_statement::TEXT,
    action_timing::TEXT
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  ORDER BY event_object_table, trigger_name;
$$;

-- Function to get custom functions
CREATE OR REPLACE FUNCTION get_functions()
RETURNS TABLE(
  function_name TEXT,
  function_type TEXT,
  return_type TEXT,
  language TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.proname::TEXT AS function_name,
    CASE 
      WHEN p.prokind = 'f' THEN 'function'
      WHEN p.prokind = 'p' THEN 'procedure'
      WHEN p.prokind = 'a' THEN 'aggregate'
      WHEN p.prokind = 'w' THEN 'window'
      ELSE 'unknown'
    END::TEXT AS function_type,
    pg_catalog.format_type(p.prorettype, NULL)::TEXT AS return_type,
    l.lanname::TEXT AS language
  FROM pg_catalog.pg_proc p
  LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  LEFT JOIN pg_catalog.pg_language l ON l.oid = p.prolang
  WHERE n.nspname = 'public'
    AND p.proname NOT LIKE 'pg_%'
  ORDER BY p.proname;
$$;

-- Function to check if a specific function exists
CREATE OR REPLACE FUNCTION check_function_exists(function_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM pg_catalog.pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = $1
  );
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_schema_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_primary_keys(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_foreign_keys(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION get_triggers() TO authenticated;
GRANT EXECUTE ON FUNCTION get_functions() TO authenticated;
GRANT EXECUTE ON FUNCTION check_function_exists(TEXT) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Schema inspection functions created successfully!';
  RAISE NOTICE 'You can now run the comprehensive-schema-inspector.js script.';
END $$;