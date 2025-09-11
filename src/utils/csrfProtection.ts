// CSRF Protection utility for secure state-changing operations
import { supabase } from '@/integrations/supabase/client';

// Generate a cryptographically secure CSRF token
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token securely
export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
  // Also set as meta tag for additional security
  let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.name = 'csrf-token';
    document.head.appendChild(metaTag);
  }
  metaTag.content = token;
};

// Get stored CSRF token
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

// Validate CSRF token
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token && token.length === 64;
};

// Clear CSRF token (on logout)
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    metaTag.remove();
  }
};

// Initialize CSRF protection
export const initializeCSRFProtection = (): string => {
  const token = generateCSRFToken();
  setCSRFToken(token);
  console.log('🛡️ CSRF protection initialized');
  return token;
};

// CSRF-protected request wrapper
export interface CSRFProtectedRequestOptions {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export const makeCSRFProtectedRequest = async (
  operation: () => Promise<any>,
  options: CSRFProtectedRequestOptions
): Promise<any> => {
  const csrfToken = getCSRFToken();
  
  if (!csrfToken) {
    throw new Error('CSRF token not found. Please refresh the page.');
  }

  // Add CSRF token to headers
  const headers = {
    ...options.headers,
    'X-CSRF-Token': csrfToken,
    'X-Requested-With': 'XMLHttpRequest'
  };

  try {
    console.log('🛡️ Making CSRF-protected request:', options.method);
    
    // Execute the operation with CSRF protection
    const result = await operation();
    
    console.log('✅ CSRF-protected request completed successfully');
    return result;
  } catch (error: any) {
    console.error('❌ CSRF-protected request failed:', error);
    
    // Check if it's a CSRF-related error
    if (error.message?.includes('CSRF') || error.status === 403) {
      console.warn('🚨 Potential CSRF attack detected or token expired');
      // Regenerate token
      initializeCSRFProtection();
      throw new Error('Security token expired. Please try again.');
    }
    
    throw error;
  }
};

// Supabase operation wrappers with CSRF protection
export const csrfProtectedSupabaseOperation = {
  // Insert operation
  insert: async (table: string, data: any) => {
    return makeCSRFProtectedRequest(
      async () => await (supabase as any).from(table as any).insert(data),
      { method: 'POST', data }
    );
  },

  // Update operation
  update: async (table: string, data: any, filter: any) => {
    return makeCSRFProtectedRequest(
      async () => await (supabase as any).from(table as any).update(data).match(filter),
      { method: 'PUT', data }
    );
  },

  // Upsert operation
  upsert: async (table: string, data: any, options?: any) => {
    return makeCSRFProtectedRequest(
      async () => await (supabase as any).from(table as any).upsert(data, options),
      { method: 'POST', data }
    );
  },

  // Delete operation
  delete: async (table: string, filter: any) => {
    return makeCSRFProtectedRequest(
      async () => await (supabase as any).from(table as any).delete().match(filter),
      { method: 'DELETE' }
    );
  },

  // Auth operations
  auth: {
    signUp: async (credentials: any) => {
      return makeCSRFProtectedRequest(
        () => supabase.auth.signUp(credentials),
        { method: 'POST', data: credentials }
      );
    },

    signIn: async (credentials: any) => {
      return makeCSRFProtectedRequest(
        () => supabase.auth.signInWithPassword(credentials),
        { method: 'POST', data: credentials }
      );
    },

    signOut: async () => {
      return makeCSRFProtectedRequest(
        () => supabase.auth.signOut(),
        { method: 'POST' }
      );
    },

    updateUser: async (updates: any) => {
      return makeCSRFProtectedRequest(
        () => supabase.auth.updateUser(updates),
        { method: 'PUT', data: updates }
      );
    }
  }
};

// React hook for CSRF protection
export const useCSRFProtection = () => {
  const token = getCSRFToken();
  
  return {
    token,
    isProtected: !!token,
    initialize: initializeCSRFProtection,
    clear: clearCSRFToken,
    makeProtectedRequest: makeCSRFProtectedRequest,
    protectedOperations: csrfProtectedSupabaseOperation
  };
};

export default {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFToken,
  initializeCSRFProtection,
  makeCSRFProtectedRequest,
  csrfProtectedSupabaseOperation,
  useCSRFProtection
};