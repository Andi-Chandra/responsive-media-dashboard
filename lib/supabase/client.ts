import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './schema'

// Create a Supabase client for interacting with the database from the client side
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Helper function to get the Supabase client instance
export const supabase = createClient()