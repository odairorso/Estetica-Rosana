import { createClient } from '@supabase/supabase-js'
import { SYSTEM_CONFIG } from '@/config/system';

// MODO OFFLINE COMPLETO - SUPABASE TOTALMENTE DESABILITADO
const supabaseUrl = ''  // VAZIO para forçar offline
const supabaseAnonKey = ''  // VAZIO para forçar offline

let supabase: ReturnType<typeof createClient> | null = null;
let isOfflineMode = true; // SEMPRE OFFLINE

// FORÇAR MODO OFFLINE SEMPRE - SEM SUPABASE
console.log("🚑 SUPABASE TOTALMENTE DESABILITADO - Modo offline permanente para evitar erros 400");
supabase = null;
isOfflineMode = true;

export { supabase, isOfflineMode }