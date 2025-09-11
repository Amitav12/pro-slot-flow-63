// Security headers and configuration for production deployment

// Content Security Policy configuration
export const generateCSP = (): string => {
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      "'unsafe-eval'", // Required for Vite in development
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://js.stripe.com' // Add Stripe scripts
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled components
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      '*.supabase.co' // Supabase storage
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co', // Supabase API
      'wss://*.supabase.co', // Supabase realtime
      'https://api.stripe.com', // Stripe API
      'https://checkout.stripe.com' // Stripe checkout
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://checkout.stripe.com'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': []
  };

  return Object.entries(cspDirectives)
    .map(([directive, sources]) => 
      sources.length > 0 ? `${directive} ${sources.join(' ')}` : directive
    )
    .join('; ');
};

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()'
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Apply security headers to document
export const applySecurityHeaders = (): void => {
  try {
    // Only apply headers that can be set via meta tags
    const metaHeaders = {
      'Content-Security-Policy': generateCSP(),
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    
    // Add meta tags for security headers that support it
    Object.entries(metaHeaders).forEach(([name, value]) => {
      let metaTag = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.httpEquiv = name;
        document.head.appendChild(metaTag);
      }
      
      metaTag.content = value;
    });

    // Note: Other security headers like X-Frame-Options, X-Content-Type-Options, etc.
    // can only be set by the server via HTTP headers, not via meta tags.
    // These should be configured in your production server (Nginx, Apache, etc.)

    console.log('🛡️ Security headers applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply security headers:', error);
  }
};

// Security event logging
export interface SecurityEvent {
  type: 'csrf_violation' | 'session_tampering' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: number;
  userAgent: string;
  ip?: string;
}

export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp' | 'userAgent'>): void => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('🚨 Security Event:', securityEvent);
  }

  // In production, send to security monitoring service
  if (import.meta.env.PROD) {
    // Send to your security monitoring service
    // Example: sendToSecurityService(securityEvent);
    
    // Store in local storage for debugging (remove in production)
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    events.push(securityEvent);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(events));
  }
};

// Security monitoring
export const initializeSecurityMonitoring = (): void => {
  // Monitor for console access attempts
  if (import.meta.env.PROD) {
    const originalConsole = { ...console };
    
    // Override console methods in production
    Object.keys(console).forEach((method) => {
      if (typeof (console as any)[method] === 'function') {
        (console as any)[method] = (...args: any[]) => {
          // Log security event for console access
          logSecurityEvent({
            type: 'suspicious_activity',
            severity: 'low',
            details: { 
              action: 'console_access',
              method,
              args: args.slice(0, 2) // Only log first 2 args for privacy
            }
          });
          
          // Still allow console in development builds
          return (originalConsole as any)[method]?.apply(console, args);
        };
      }
    });
  }

  // Monitor for DevTools
  let devtools = { open: false, orientation: null };
  const threshold = 160;

  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { action: 'devtools_opened' }
        });
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Monitor for right-click context menu
  document.addEventListener('contextmenu', (e) => {
    if (import.meta.env.PROD) {
      e.preventDefault();
      logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'low',
        details: { action: 'context_menu_attempt' }
      });
    }
  });

  // Monitor for key combinations (F12, Ctrl+Shift+I, etc.)
  document.addEventListener('keydown', (e) => {
    if (import.meta.env.PROD) {
      const suspiciousKeys = [
        e.key === 'F12',
        (e.ctrlKey && e.shiftKey && e.key === 'I'),
        (e.ctrlKey && e.shiftKey && e.key === 'C'),
        (e.ctrlKey && e.shiftKey && e.key === 'J'),
        (e.ctrlKey && e.key === 'U')
      ];

      if (suspiciousKeys.some(Boolean)) {
        e.preventDefault();
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { 
            action: 'suspicious_key_combination',
            key: e.key,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey
          }
        });
      }
    }
  });

  console.log('🛡️ Security monitoring initialized');
};

// Secure random string generator
export const generateSecureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    })
    .trim();
};

// Validate URL
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export default {
  generateCSP,
  securityHeaders,
  applySecurityHeaders,
  logSecurityEvent,
  initializeSecurityMonitoring,
  generateSecureRandomString,
  sanitizeInput,
  isValidURL
};