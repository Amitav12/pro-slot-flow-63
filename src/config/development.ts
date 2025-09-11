// Development configuration
export const DEV_CONFIG = {
  // Set to true to bypass authentication for admin/superadmin roles
  BYPASS_ADMIN_AUTH: true,
  
  // Set to true to use mock data instead of Supabase (for when DB is not set up)
  USE_MOCK_DATA: false,
  
  // Mock admin user for development
  MOCK_ADMIN_USER: {
    id: 'dev-admin-123',
    email: 'dev-admin@localhost.com',
    role: 'admin',
    full_name: 'Development Admin',
    is_blocked: false,
    onboarding_completed: true
  },

  // Mock superadmin user for development  
  MOCK_SUPERADMIN_USER: {
    id: 'dev-superadmin-123',
    email: 'dev-superadmin@localhost.com',
    role: 'super_admin',
    full_name: 'Development Super Admin',
    is_blocked: false,
    onboarding_completed: true
  },

  // Mock provider user for development
  MOCK_PROVIDER_USER: {
    id: 'dev-provider-123',
    email: 'dev-provider@localhost.com',
    role: 'provider',
    full_name: 'Development Provider',
    business_name: 'Dev Services LLC',
    is_blocked: false,
    onboarding_completed: true
  }
};

// Helper to check if we're in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
};

// Helper to check if admin auth should be bypassed
export const shouldBypassAdminAuth = () => {
  return isDevelopment() && DEV_CONFIG.BYPASS_ADMIN_AUTH;
};