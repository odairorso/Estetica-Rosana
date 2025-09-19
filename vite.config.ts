import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  server: {
    host: "::",
    port: 8080,
  },
<<<<<<< HEAD
  plugins: [react()],
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select"],
          supabase: ["@supabase/supabase-js"]
  // Configurações importantes para build na Vercel
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
        }
      }
    }
  },
<<<<<<< HEAD
  base: "/",
  define: {
    global: "globalThis",
  }
});
  // Garantir que rotas SPA funcionem corretamente
  base: '/',
}));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações importantes para build na Vercel
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  // Garantir que rotas SPA funcionem corretamente
  base: '/',
}));
=======
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  server: {
    host: "::",
    port: 8080,
  },
<<<<<<< HEAD
  plugins: [react()],
=======
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select"],
          supabase: ["@supabase/supabase-js"]
=======
  // Configurações importantes para build na Vercel
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
        }
      }
    }
  },
<<<<<<< HEAD
  base: "/",
  define: {
    global: "globalThis",
  }
});
=======
  // Garantir que rotas SPA funcionem corretamente
  base: '/',
}));
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
