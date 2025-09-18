import { createClient } from '@supabase/supabase-js'
import { SYSTEM_CONFIG } from '@/config/system';

// REATIVAR SUPABASE PARA USAR DADOS REAIS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null;
let isOfflineMode = false; // PERMITIR ONLINE PARA DADOS REAIS

// CONECTAR AO SUPABASE REAL SE CONFIGURADO
if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey && supabaseAnonKey.length > 20) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Manter sessão
      autoRefreshToken: true, // Permitir refresh
      detectSessionInUrl: true // Detectar sessão na URL
    }
  });
  isOfflineMode = false;
  console.log("☁️ SUPABASE CONECTADO - Usando dados reais da nuvem");
} else {
  console.warn("⚠️ Executando em modo offline - configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY");
  isOfflineMode = true;
  supabase = null;
}

export { supabase, isOfflineMode }