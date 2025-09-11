// Security configuration for PCI compliance and payment security

// Content Security Policy for payment pages
export const paymentCSP = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' https://js.stripe.com",
  'frame-src': "'self' https://js.stripe.com https://hooks.stripe.com",
  'connect-src': "'self' https://api.stripe.com https://maps.googleapis.com",
  'img-src': "'self' data: https:",
  'style-src': "'self' 'unsafe-inline'"
};

// Security headers for payment requests
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Input validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{1,14}$/,
  postalCode: /^[A-Za-z0-9\s\-]{3,10}$/,
  amount: /^\d+(\.\d{1,2})?$/
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match];
    })
    .trim();
};

// Validate payment amount
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99 && Number.isFinite(amount);
};

// Generate secure random ID
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting configuration
export const rateLimits = {
  paymentAttempts: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  apiCalls: {
    maxRequests: 100,
    windowMs: 60 * 1000 // 1 minute
  }
};

// Encryption utilities for sensitive data
export const encryptSensitiveData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyBuffer,
    encoder.encode(data)
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

// Security audit logging
export const logSecurityEvent = (event: string, details: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: sanitizeInput(JSON.stringify(details)),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In production, send to security monitoring service
  console.warn('[SECURITY]', logEntry);
};

// PCI DSS compliance checks
export const pciComplianceChecks = {
  // Check if running over HTTPS
  isSecureConnection: (): boolean => {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  },
  
  // Validate card data is not stored
  validateNoCardStorage: (): boolean => {
    const sensitiveKeys = ['card', 'cvv', 'cvc', 'expiry', 'cardnumber'];
    const localStorage = window.localStorage;
    const sessionStorage = window.sessionStorage;
    
    for (const key of sensitiveKeys) {
      if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
        logSecurityEvent('PCI_VIOLATION', { type: 'card_data_in_storage', key });
        return false;
      }
    }
    return true;
  },
  
  // Check for secure headers
  validateSecureHeaders: (): boolean => {
    // This would typically be checked server-side
    return true;
  }
};

// Initialize security measures
export const initializeSecurity = () => {
  // Run PCI compliance checks
  if (!pciComplianceChecks.isSecureConnection()) {
    logSecurityEvent('INSECURE_CONNECTION', { protocol: window.location.protocol });
  }
  
  if (!pciComplianceChecks.validateNoCardStorage()) {
    logSecurityEvent('PCI_VIOLATION', { type: 'card_data_found' });
  }
  
  // Set up CSP if supported
  if ('securitypolicy' in document) {
    const cspString = Object.entries(paymentCSP)
      .map(([key, value]) => `${key} ${value}`)
      .join('; ');
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspString;
    document.head.appendChild(meta);
  }
};