'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const supabase = createClient()

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: { message: error.message } }
      }

      return { data: { user: data.user } }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: { message: error.message } }
    }
    return { data: {} }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      return { error: { message: error.message } }
    }
    return { data: session ? { user: session.user } : null }
  }
}

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    data: session ? { user: session.user } : null,
    loading,
    error: null
  }
}

export const signIn = authClient.signIn
export const signUp = authClient.signIn // Reuse signIn for now since sign up is disabled
export const signOut = authClient.signOut
export const getSession = authClient.getSession