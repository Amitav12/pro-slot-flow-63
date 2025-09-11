# Development Mode Configuration

## Admin Authentication Bypass

For development purposes, admin and superadmin authentication can be bypassed to allow direct access to admin features without going through the login process.

### How to Enable/Disable

Edit `src/config/development.ts`:

```typescript
export const DEV_CONFIG = {
  // Set to true to bypass authentication for admin/superadmin roles
  BYPASS_ADMIN_AUTH: true, // Change to false to re-enable auth
  
  // ... rest of config
};
```

### Development Access Routes

When `BYPASS_ADMIN_AUTH` is `true`:

1. **Direct Admin Access**: Navigate to `/admin` - will bypass all authentication
2. **Development Admin Page**: Navigate to `/dev-admin` - shows development access options
3. **Visual Indicator**: Orange banner appears at top of admin pages indicating dev mode

### Mock Admin Data

The system uses mock admin data when bypassing authentication:

- **Admin User**: `dev-admin@localhost.com`
- **Super Admin User**: `dev-superadmin@localhost.com`
- **Role**: `admin` or `super_admin`
- **Status**: Not blocked, onboarding completed

### Security Notes

- ⚠️ **Development Only**: This bypass only works when `NODE_ENV === 'development'`
- ⚠️ **Production Safe**: In production builds, authentication is always enforced
- ⚠️ **Visual Warning**: Development mode shows clear indicators when auth is bypassed

### Usage Examples

```bash
# Start development server
npm run dev

# Navigate to admin (bypassed)
http://localhost:5173/admin

# Navigate to development access page
http://localhost:5173/dev-admin
```

### Re-enabling Authentication

To re-enable authentication during development:

1. Set `BYPASS_ADMIN_AUTH: false` in `src/config/development.ts`
2. Use the existing admin login at `/admin-login`
3. Or use the demo admin account: `admin@serviceplatform.com` / `Admin@2024`

### Files Modified

- `src/config/development.ts` - Development configuration
- `src/components/ProtectedRoute.tsx` - Route protection bypass
- `src/hooks/useAuth.tsx` - Mock authentication data
- `src/hooks/useAuthAdmin.tsx` - Admin-specific auth bypass
- `src/components/dev/DevAdminAccess.tsx` - Development access page
- `src/components/dev/DevModeIndicator.tsx` - Visual development indicator