import { createBrowserClient } from '@supabase/ssr'
import { Database } from './schema'

// Create a Supabase client for interacting with the database from the client side
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables for client-side usage')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

// Helper function to get the Supabase client instance
export const supabase = createClient()
