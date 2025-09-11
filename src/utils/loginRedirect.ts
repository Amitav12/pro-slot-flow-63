/**
 * Utility functions for handling login redirects
 */

/**
 * Store the current page URL before redirecting to login
 * @param currentPath - The current page path to store
 */
export const storeRedirectUrl = (currentPath: string) => {
  // Don't store auth-related pages
  const authPages = ['/auth', '/login', '/dashboard'];
  const isAuthPage = authPages.some(page => currentPath.startsWith(page));
  
  if (!isAuthPage && currentPath !== '/') {
    localStorage.setItem('redirectAfterLogin', currentPath);
    console.log('📍 Stored redirect URL:', currentPath);
  }
};

/**
 * Redirect to login while storing the current page
 * @param currentPath - The current page path
 */
export const redirectToLogin = (currentPath: string) => {
  storeRedirectUrl(currentPath);
  window.location.href = '/auth';
};

/**
 * Get the stored redirect URL
 */
export const getStoredRedirectUrl = (): string | null => {
  return localStorage.getItem('redirectAfterLogin');
};

/**
 * Clear the stored redirect URL
 */
export const clearStoredRedirectUrl = () => {
  localStorage.removeItem('redirectAfterLogin');
};