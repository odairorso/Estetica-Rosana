import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zojtuknkuwvkbnaorfqd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Testar conexão
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro na conexão com Supabase:', error)
  } else {
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
  }
})
