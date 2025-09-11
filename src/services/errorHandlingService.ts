// Comprehensive error handling service for payment processing

import { toast } from 'sonner';
import { logSecurityEvent } from '@/config/security';

// Error types for payment processing
export enum PaymentErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CARD_DECLINED = 'CARD_DECLINED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Payment error interface
export interface PaymentError {
  type: PaymentErrorType;
  message: string;
  code?: string;
  retryable: boolean;
  userMessage: string;
  details?: any;
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: PaymentErrorType[];
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    PaymentErrorType.NETWORK_ERROR,
    PaymentErrorType.TIMEOUT_ERROR,
    PaymentErrorType.SERVER_ERROR,
    PaymentErrorType.RATE_LIMIT_ERROR
  ]
};

// Error classification function
export const classifyError = (error: any): PaymentError => {
  // Stripe-specific errors
  if (error?.type) {
    switch (error.type) {
      case 'card_error':
        if (error.code === 'card_declined') {
          return {
            type: PaymentErrorType.CARD_DECLINED,
            message: error.message,
            code: error.code,
            retryable: false,
            userMessage: 'Your card was declined. Please try a different payment method.',
            details: error
          };
        }
        if (error.code === 'insufficient_funds') {
          return {
            type: PaymentErrorType.INSUFFICIENT_FUNDS,
            message: error.message,
            code: error.code,
            retryable: false,
            userMessage: 'Insufficient funds. Please check your account balance or try a different card.',
            details: error
          };
        }
        return {
          type: PaymentErrorType.STRIPE_ERROR,
          message: error.message,
          code: error.code,
          retryable: false,
          userMessage: error.message || 'There was an issue with your payment method.',
          details: error
        };
      
      case 'validation_error':
        return {
          type: PaymentErrorType.VALIDATION_ERROR,
          message: error.message,
          code: error.code,
          retryable: false,
          userMessage: 'Please check your payment information and try again.',
          details: error
        };
      
      case 'api_error':
        return {
          type: PaymentErrorType.SERVER_ERROR,
          message: error.message,
          code: error.code,
          retryable: true,
          userMessage: 'A temporary server error occurred. Please try again.',
          details: error
        };
      
      case 'rate_limit_error':
        return {
          type: PaymentErrorType.RATE_LIMIT_ERROR,
          message: error.message,
          code: error.code,
          retryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          details: error
        };
    }
  }
  
  // Network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return {
      type: PaymentErrorType.NETWORK_ERROR,
      message: 'Network connection failed',
      retryable: true,
      userMessage: 'Network connection failed. Please check your internet connection and try again.',
      details: error
    };
  }
  
  // Timeout errors
  if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
    return {
      type: PaymentErrorType.TIMEOUT_ERROR,
      message: 'Request timed out',
      retryable: true,
      userMessage: 'The request timed out. Please try again.',
      details: error
    };
  }
  
  // Authentication errors
  if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
    return {
      type: PaymentErrorType.AUTHENTICATION_ERROR,
      message: 'Authentication failed',
      retryable: false,
      userMessage: 'Please log in again to continue.',
      details: error
    };
  }
  
  // Server errors (5xx)
  if (error?.status >= 500 && error?.status < 600) {
    return {
      type: PaymentErrorType.SERVER_ERROR,
      message: `Server error: ${error.status}`,
      retryable: true,
      userMessage: 'A server error occurred. Please try again in a few moments.',
      details: error
    };
  }
  
  // Default unknown error
  return {
    type: PaymentErrorType.UNKNOWN_ERROR,
    message: error?.message || 'An unknown error occurred',
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    details: error
  };
};

// Exponential backoff delay calculation
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Sleep utility function
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry wrapper function
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: PaymentError;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);
      
      // Log the error
      logSecurityEvent('PAYMENT_ERROR', {
        attempt,
        errorType: lastError.type,
        message: lastError.message,
        code: lastError.code
      });
      
      // Check if error is retryable and we have attempts left
      if (!finalConfig.retryableErrors.includes(lastError.type) || 
          attempt === finalConfig.maxAttempts) {
        throw lastError;
      }
      
      // Calculate delay and wait before retry
      const delay = calculateDelay(attempt, finalConfig);
      console.warn(`Payment attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Error handler for UI components
export const handlePaymentError = (error: any, showToast: boolean = true): PaymentError => {
  const paymentError = classifyError(error);
  
  // Log security event for certain error types
  if ([PaymentErrorType.AUTHENTICATION_ERROR, PaymentErrorType.VALIDATION_ERROR].includes(paymentError.type)) {
    logSecurityEvent('PAYMENT_SECURITY_ERROR', {
      errorType: paymentError.type,
      message: paymentError.message
    });
  }
  
  // Show user-friendly toast message
  if (showToast) {
    toast.error(paymentError.userMessage);
  }
  
  return paymentError;
};

// Circuit breaker pattern for payment services
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
  
  getState() {
    return this.state;
  }
}

// Global circuit breaker for payment operations
export const paymentCircuitBreaker = new CircuitBreaker(5, 60000);

// Enhanced payment operation wrapper
export const executePaymentOperation = async <T>(
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>
): Promise<T> => {
  return paymentCircuitBreaker.execute(() => 
    withRetry(operation, retryConfig)
  );
};

// Error recovery suggestions
export const getErrorRecoveryActions = (error: PaymentError): string[] => {
  const actions: string[] = [];
  
  switch (error.type) {
    case PaymentErrorType.CARD_DECLINED:
      actions.push('Try a different payment method');
      actions.push('Contact your bank to verify the transaction');
      actions.push('Check if your card supports online payments');
      break;
      
    case PaymentErrorType.INSUFFICIENT_FUNDS:
      actions.push('Check your account balance');
      actions.push('Try a different payment method');
      actions.push('Contact your bank for assistance');
      break;
      
    case PaymentErrorType.NETWORK_ERROR:
      actions.push('Check your internet connection');
      actions.push('Try again in a few moments');
      actions.push('Switch to a different network if possible');
      break;
      
    case PaymentErrorType.VALIDATION_ERROR:
      actions.push('Double-check your payment information');
      actions.push('Ensure all required fields are filled correctly');
      actions.push('Verify your billing address matches your card');
      break;
      
    case PaymentErrorType.AUTHENTICATION_ERROR:
      actions.push('Log out and log back in');
      actions.push('Clear your browser cache and cookies');
      actions.push('Try using a different browser');
      break;
      
    default:
      actions.push('Try again in a few moments');
      actions.push('Contact customer support if the problem persists');
      actions.push('Use a different payment method');
  }
  
  return actions;
};