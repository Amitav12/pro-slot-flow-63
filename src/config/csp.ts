export class CSPConfigService {
  private supabaseUrl: string;
  private supabaseDomain: string;
  private supabaseWildcard: string;
  private supabaseWss: string;
  private cdnDomains: string[];

  constructor(env?: Record<string, string>) {
    // Use provided env or fallback to defaults
    const envVars = env || {};
    
    this.supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://igezuyqvfoxolxbudcyj.supabase.co';
    this.supabaseDomain = new URL(this.supabaseUrl).origin;
    this.supabaseWildcard = this.supabaseDomain.replace(/https:\/\/[^.]+/, 'https://*');
    this.supabaseWss = this.supabaseDomain.replace('https:', 'wss:');
    
    const cdnDomainsEnv = envVars.VITE_CDN_DOMAINS || 'https://cdn.jsdelivr.net,https://unpkg.com,https://fonts.googleapis.com,https://fonts.gstatic.com';
    this.cdnDomains = cdnDomainsEnv.split(',').map(domain => domain.trim());
  }

  private getDirectives(): Record<string, string> {
    return {
      'default-src': "'self'",
      'script-src': `'self' 'unsafe-inline' 'unsafe-eval' ${this.cdnDomains.join(' ')}`,
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'img-src': `'self' data: blob: ${this.supabaseDomain} ${this.supabaseDomain}/storage/v1/object/public/*`,
      'media-src': `'self' ${this.supabaseDomain} ${this.supabaseDomain}/storage/v1/object/public/*`,
      'font-src': "'self' https://fonts.gstatic.com",
      'connect-src': `'self' ${this.supabaseDomain} ${this.supabaseWildcard} ${this.supabaseWss} wss://*.supabase.co`,
      'frame-src': "'self'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
      'upgrade-insecure-requests': ''
    };
  }

  public generateCSPString(): string {
    const directives = this.getDirectives();
    return Object.entries(directives)
      .map(([key, value]) => value ? `${key} ${value}` : key)
      .join('; ');
  }

  public logCSPPolicy(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 CSP Configuration Applied:');
      console.log('📡 Supabase Domain:', this.supabaseDomain);
      console.log('🎬 Media-src directive:', `'self' ${this.supabaseDomain} ${this.supabaseDomain}/storage/v1/object/public/*`);
      console.log('🌐 CDN Domains:', this.cdnDomains);
      console.log('📋 Full CSP:', this.generateCSPString());
    }
  }

  public generateNetlifyHeaders(): string {
    const csp = this.generateCSPString();
    return `/*
  Content-Security-Policy: ${csp}
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()`;
  }

  public generateNetlifyToml(): string {
    const csp = this.generateCSPString();
    return `[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "${csp}"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
  }

}