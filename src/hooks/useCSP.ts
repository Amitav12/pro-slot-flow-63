import { useEffect } from 'react';
import { CSPConfigService } from '../config/csp';

export const useCSP = () => {
  useEffect(() => {
    // Get environment variables for browser context
    const env = import.meta.env || {};
    const cspService = new CSPConfigService(env);
    
    // Remove any existing CSP meta tags
    const existingCSPTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    existingCSPTags.forEach(tag => tag.remove());
    
    // Create and inject new CSP meta tag
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', cspService.generateCSPString());
    
    // Add to document head
    document.head.appendChild(metaTag);
    
    // Log CSP policy in development
    cspService.logCSPPolicy();
    
    // Cleanup function to remove CSP tag on unmount
    return () => {
      const cspTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspTag) {
        cspTag.remove();
      }
    };
  }, []);
};