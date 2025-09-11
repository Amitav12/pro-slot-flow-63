// Secure storage utility for persistent user session and role management
import * as CryptoJS from 'crypto-js';

const STORAGE_KEY = 'pro_slot_flow_session';
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';

export interface SecureSessionData {
  userId: string;
  role: 'customer' | 'provider' | 'admin' | 'super_admin';
  email: string;
  sessionId: string;
  expiresAt: number;
  lastValidated: number;
}

export class SecureStorage {
  private static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }

  private static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  static setSession(sessionData: SecureSessionData): boolean {
    try {
      const dataString = JSON.stringify(sessionData);
      const encryptedData = this.encrypt(dataString);
      
      if (!encryptedData) {
        console.error('Failed to encrypt session data');
        return false;
      }

      localStorage.setItem(STORAGE_KEY, encryptedData);
      
      // Also set a secure cookie for server-side validation
      document.cookie = `session_token=${sessionData.sessionId}; Secure; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
      
      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  }

  static getSession(): SecureSessionData | null {
    try {
      const encryptedData = localStorage.getItem(STORAGE_KEY);
      
      if (!encryptedData) {
        return null;
      }

      const decryptedData = this.decrypt(encryptedData);
      
      if (!decryptedData) {
        console.warn('Failed to decrypt session data');
        this.clearSession();
        return null;
      }

      const sessionData: SecureSessionData = JSON.parse(decryptedData);
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        console.warn('Session expired');
        this.clearSession();
        return null;
      }

      // Check if session needs revalidation (every 5 minutes)
      const REVALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - sessionData.lastValidated > REVALIDATION_INTERVAL) {
        console.log('Session needs revalidation');
        return { ...sessionData, needsRevalidation: true } as any;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  static updateLastValidated(): boolean {
    try {
      const session = this.getSession();
      if (!session) {
        return false;
      }

      const updatedSession = {
        ...session,
        lastValidated: Date.now()
      };

      return this.setSession(updatedSession);
    } catch (error) {
      console.error('Failed to update validation timestamp:', error);
      return false;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // Clear all related storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  static isValidSession(): boolean {
    const session = this.getSession();
    return session !== null && !('needsRevalidation' in session);
  }

  static getStoredRole(): string | null {
    const session = this.getSession();
    return session ? session.role : null;
  }

  static validateSessionIntegrity(serverSessionId: string): boolean {
    const session = this.getSession();
    
    if (!session) {
      return false;
    }

    // Validate session ID matches server
    if (session.sessionId !== serverSessionId) {
      console.warn('Session ID mismatch detected');
      this.clearSession();
      return false;
    }

    return true;
  }
}

// Session validation hook for React components
export const useSecureSession = () => {
  const session = SecureStorage.getSession();
  
  return {
    session,
    isValid: SecureStorage.isValidSession(),
    role: session?.role || null,
    needsRevalidation: session && 'needsRevalidation' in session,
    clearSession: SecureStorage.clearSession,
    updateValidation: SecureStorage.updateLastValidated
  };
};

export default SecureStorage;