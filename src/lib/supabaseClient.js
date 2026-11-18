import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('xyzcompany') &&
  !supabaseUrl.includes('your-project-id')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Flash Services Courier Cargo] Supabase URL o clave publicable no están configuradas correctamente en .env.local.\n' +
    'Por favor ingresa las credenciales reales de tu proyecto de Supabase.'
  )
}

/**
 * Cliente unificado de Supabase para Flash Services Courier Cargo.
 * Maneja Autenticación, PostgreSQL (PostgREST queries) y Storage (Buckets).
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export default supabase
