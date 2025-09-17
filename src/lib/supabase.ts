import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
  birth_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: number
  duration: number
  description?: string
  icon?: string
  popular: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  service_id: string
  client_id?: string
  client_name: string
  client_phone?: string
  appointment_date: string
  appointment_time: string
  duration: number
  price: number
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  service?: Service
  client?: Client
}

export interface Package {
  id: string
  name: string
  description?: string
  client_id: string
  total_sessions: number
  used_sessions: number
  remaining_sessions: number
  price: number
  valid_until?: string
  last_used?: string
  status: 'active' | 'expired' | 'completed'
  created_at: string
  updated_at: string
  client?: Client
}

export interface SessionHistory {
  id: string
  package_id: string
  session_date: string
  notes?: string
  created_at: string
  updated_at: string
  package?: Package
}