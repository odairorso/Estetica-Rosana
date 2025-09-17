import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null;

// Verificação mais robusta para garantir que a URL seja válida antes de criar o cliente
if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Credenciais do Supabase não encontradas ou inválidas. Executando em modo offline.");
  supabase = null;
}

export { supabase }