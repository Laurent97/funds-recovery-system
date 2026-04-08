import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkpiczemojgcciooxejp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcGljemVtb2pnY2Npb294ZWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDY2MDgsImV4cCI6MjA5MTE4MjYwOH0.KCViY-kT3xFRR_IssVen_f1tRxAVwbCH7LdqMwfuYHY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
