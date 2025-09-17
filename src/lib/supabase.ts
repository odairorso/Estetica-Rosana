import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we're in development mode and the variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Using mock mode for development.")
  // We'll export a mock client in this case
  export const supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    auth: {
      signIn: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => {},
    }
  }
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}