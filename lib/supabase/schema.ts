export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          type: 'slider' | 'gallery' | 'video'
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          type: 'slider' | 'gallery' | 'video'
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          type?: 'slider' | 'gallery' | 'video'
          updated_at?: string
        }
      }
      media_items: {
        Row: {
          alt_text: string | null
          category_id: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean
          metadata: Json | null
          sort_order: number
          thumbnail_url: string | null
          title: string
          type: 'slider' | 'gallery' | 'video'
          updated_at: string
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          type: 'slider' | 'gallery' | 'video'
          updated_at?: string
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          type?: 'slider' | 'gallery' | 'video'
          updated_at?: string
          video_duration?: number | null
          video_url?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: 'user' | 'admin'
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: 'user' | 'admin'
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: 'user' | 'admin'
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}