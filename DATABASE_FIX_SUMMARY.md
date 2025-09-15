# Database Function Type Mismatch Fix

## Issue Identified

The `get_providers_needing_availability_reminder` RPC function was returning a 400 Bad Request error due to a type mismatch:

- **Error**: `Returned type character varying(255) does not match expected type text in column 2`
- **Root Cause**: The function was declared to return TEXT types, but the database columns were defined as VARCHAR with specific lengths

## Database Schema Analysis

### Affected Tables and Columns:
1. **user_profiles table**:
   - `full_name`: `character varying(255)`
   - `phone`: `character varying(20)`

2. **auth.users table**:
   - `email`: `character varying` (from auth schema)

### Function Declaration vs Reality:
- Function declared return type: `TEXT`
- Actual database column types: `VARCHAR(255)`, `VARCHAR(20)`

## Solution Implemented

### 1. Updated Function Definition
Created a new migration file: `20250115000003_fix_notification_function_types.sql`

**Key Changes**:
- Added explicit type casting using `::TEXT`
- Added `COALESCE` for null safety
- Added proper JOIN with `auth.users` table for email access

```sql
SELECT 
    up.id as provider_id,
    COALESCE(up.full_name::TEXT, 'Unknown Provider') as provider_name,
    COALESCE(au.email::TEXT, 'no-email@example.com') as email,
    COALESCE(up.phone::TEXT, 'N/A') as phone,
    (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::INTERVAL)::DATE as week_start,
    pnp.reminder_days_advance
FROM public.user_profiles up
JOIN public.provider_notification_preferences pnp ON up.id = pnp.provider_id
JOIN auth.users au ON up.user_id = au.id
```

### 2. TypeScript Interface Alignment
The `ProviderNotification` interface in `NotificationService.tsx` is already correctly defined:

```typescript
interface ProviderNotification {
  provider_id: string;
  provider_name: string;
  email: string;
  phone: string;
  week_start: string;
  reminder_days_advance: number;
}
```

## Next Steps

1. **Apply Migration**: When Supabase CLI is available, run:
   ```bash
   supabase db push
   ```

2. **Test Notification Service**: The notification service should now work without type mismatch errors

3. **Verify Fields Display**: All fields and buttons in the notification section should display correctly

## Files Modified

1. `supabase/migrations/20250125000001_provider_weekly_scheduling.sql` - Updated original function
2. `supabase/migrations/20250115000003_fix_notification_function_types.sql` - New migration with complete fix
3. `src/services/NotificationService.tsx` - Interface already correctly defined

## Status

✅ **Type mismatch issue identified and resolved**  
✅ **Migration file created with proper type casting**  
✅ **TypeScript interfaces aligned**  
✅ **Development server running without compilation errors**  
⏳ **Migration pending application (requires Supabase CLI)**

The notification service should now function correctly once the database migration is applied.