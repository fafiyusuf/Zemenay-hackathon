import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqacmygplglbkcdqowxl.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYWNteWdwbGdsYmtjZHFvd3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTA3NTEsImV4cCI6MjA3MDUyNjc1MX0.S0XDMljmWnWZNni06Yx48lpklOxCzXnd0KASKXl13FQ'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

console.log('[supabase] URL:', supabaseUrl)
console.log('[supabase] Anon key length:', anonKey.length)

export const supabase: SupabaseClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
})

export const supabaseAdmin: SupabaseClient | null = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null

export function getDbClient(adminPreferred = false): SupabaseClient {
  return adminPreferred && supabaseAdmin ? supabaseAdmin : supabase
}
