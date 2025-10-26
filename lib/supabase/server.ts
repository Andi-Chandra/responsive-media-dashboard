import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './schema'

// Create a Supabase client for interacting with the database from the server side
export const createServerClient = async () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables for server-side usage')
  }

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // ignore in read-only contexts (e.g., React Server Components)
          }
        })
      },
    },
  })
}

// Helper function to get the current user from the server side
export const getCurrentUser = async () => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to get the current user's profile
export const getCurrentUserProfile = async () => {
  const supabase = await createServerClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Helper function to check if current user is an admin
export const isAdmin = async () => {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'admin'
}
