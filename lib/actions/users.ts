'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

// Get all users (admin only)
export async function getUsers() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data || []
}

// Get single user
export async function getUser(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

// Create user (admin only)
export async function createUser(userData: {
  email: string
  full_name?: string
  role?: 'user' | 'admin'
  temporary_password: string
}) {
  const supabase = await createServerClient()

  try {
    // First create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.temporary_password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role || 'user'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw new Error('Failed to create user account')
    }

    // The trigger will automatically create the profile
    revalidatePath('/dashboard/users')
    return authData.user
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

// Update user role
export async function updateUserRole(id: string, role: 'user' | 'admin') {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }

  revalidatePath('/dashboard/users')
  return data
}

// Update user profile
export async function updateUserProfile(id: string, profile: Partial<UserProfile>) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }

  revalidatePath('/dashboard/users')
  return data
}

// Delete user (admin only)
export async function deleteUser(id: string) {
  const supabase = await createServerClient()

  try {
    // Delete user from auth.users (this will cascade to profiles)
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      console.error('Error deleting auth user:', error)
      throw new Error('Failed to delete user account')
    }

    revalidatePath('/dashboard/users')
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Reset user password
export async function resetUserPassword(id: string, newPassword: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: newPassword
  })

  if (error) {
    console.error('Error resetting password:', error)
    throw new Error('Failed to reset password')
  }

  return { success: true }
}