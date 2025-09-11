// Production error handler to suppress browser extension conflicts
export const setupProductionErrorHandling = () => {
  // Suppress browser extension errors in production
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections (like the message channel error)
    window.addEventListener('unhandledrejection', (event) => {
      // Check if it's a browser extension error
      if (
        event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('Extension context invalidated') ||
        event.reason?.message?.includes('listener indicated an asynchronous response') ||
        event.reason?.message?.includes('A listener indicated an asynchronous response')
      ) {
        // Suppress these errors in production
        event.preventDefault();
        console.debug('Suppressed browser extension error:', event.reason?.message);
        return;
      }
      
      // Log other errors for debugging (but not in production)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unhandled promise rejection:', event.reason);
      }
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
      // Suppress browser extension errors
      if (
        event.message?.includes('Extension context invalidated') ||
        event.message?.includes('message channel closed') ||
        event.filename?.includes('extension')
      ) {
        event.preventDefault();
        console.debug('Suppressed browser extension error:', event.message);
        return;
      }
      
      // Log other errors
      console.error('Global error:', event.error || event.message);
    });

    // Override console.error to filter extension errors in production
    if (process.env.NODE_ENV === 'production') {
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (
          message.includes('message channel closed') ||
          message.includes('Extension context invalidated') ||
          message.includes('listener indicated an asynchronous response')
        ) {
          // Don't log extension errors in production
          return;
        }
        originalError.apply(console, args);
      };
    }
  }
};

// Initialize error handling
setupProductionErrorHandling();