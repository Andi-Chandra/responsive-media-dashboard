'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Types
export type MediaType = 'slider' | 'gallery' | 'video'

export interface MediaItem {
  id?: string
  title: string
  description?: string
  type: MediaType
  category_id?: string
  file_url: string
  thumbnail_url?: string
  alt_text?: string
  video_url?: string
  video_duration?: number
  file_size?: number
  dimensions?: { width: number; height: number }
  metadata?: Record<string, any>
  is_active?: boolean
  sort_order?: number
}

// Get all media items
export async function getMediaItems(type?: MediaType) {
  const supabase = await createServerClient()

  let query = supabase
    .from('media_items')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching media items:', error)
    return []
  }

  return data || []
}

// Get single media item
export async function getMediaItem(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('media_items')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching media item:', error)
    return null
  }

  return data
}

// Create media item
export async function createMediaItem(item: Omit<MediaItem, 'id'>) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('media_items')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('Error creating media item:', error)
    throw new Error('Failed to create media item')
  }

  revalidatePath('/dashboard')
  return data
}

// Update media item
export async function updateMediaItem(id: string, item: Partial<MediaItem>) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('media_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating media item:', error)
    throw new Error('Failed to update media item')
  }

  revalidatePath('/dashboard')
  return data
}

// Delete media item
export async function deleteMediaItem(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting media item:', error)
    throw new Error('Failed to delete media item')
  }

  revalidatePath('/dashboard')
}

// Toggle media item active status
export async function toggleMediaItemStatus(id: string, isActive: boolean) {
  return updateMediaItem(id, { is_active: isActive })
}

// Update sort order
export async function updateMediaSortOrder(items: { id: string; sort_order: number }[]) {
  const supabase = await createServerClient()

  const promises = items.map(({ id, sort_order }) =>
    supabase
      .from('media_items')
      .update({ sort_order })
      .eq('id', id)
  )

  try {
    await Promise.all(promises)
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error updating sort order:', error)
    throw new Error('Failed to update sort order')
  }
}