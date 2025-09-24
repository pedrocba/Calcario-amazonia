import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com fallback para variáveis hardcoded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rfdedsmxhsxalyzxstxh.supabase.co'
// Usando service role key temporariamente para bypass de autenticação
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZGVkc214aHN4YWx5enhzdHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2NDIzMSwiZXhwIjoyMDczNjQwMjMxfQ.h5q1pNdcVerUXPlHGoTL07wkIBDkIzlW9w_h-sDtciM'

console.log('🔧 Supabase URL:', supabaseUrl ? '✅ Carregada' : '❌ Não carregada')
console.log('🔧 Supabase Key:', supabaseAnonKey ? '✅ Carregada' : '❌ Não carregada')

// Criar uma única instância do cliente Supabase (Singleton)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Exportar a instância única
export default supabaseClient

// Exportar também como supabase para compatibilidade
export { supabaseClient as supabase }










