import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './schema'

// Create a Supabase client for interacting with the database from the server side
export const createServerClient = async () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
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