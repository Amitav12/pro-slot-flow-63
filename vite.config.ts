import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { CSPConfigService } from "./src/config/csp";

// Environment-aware CSP plugin for build-time file generation
function cspBuildPlugin(env: Record<string, string>) {
  return {
    name: "csp-build-plugin",
    generateBundle(this: { emitFile: (options: { type: string; fileName: string; source: string }) => void }) {
      const cspService = new CSPConfigService(env);
      
      // Generate netlify.toml
      const netlifyToml = cspService.generateNetlifyToml();
      this.emitFile({
        type: 'asset',
        fileName: 'netlify.toml',
        source: netlifyToml
      });
      
      // Generate _headers file
      const headersFile = cspService.generateNetlifyHeaders();
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: headersFile
      });
      
      console.log('✅ Generated CSP deployment files: netlify.toml, _headers');
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  const cspService = new CSPConfigService(env);
  
  return {
    server: {
      host: "::",
      port: 8080,
      headers: {
        "Content-Security-Policy": cspService.generateCSPString()
      }
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      cspBuildPlugin(env)
    ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
