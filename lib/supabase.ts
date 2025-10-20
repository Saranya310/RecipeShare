import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          emoji: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          emoji?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          emoji?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          ingredients: string[]
          instructions: string[]
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          difficulty: 'Easy' | 'Medium' | 'Hard' | null
          image_url: string | null
          category_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ingredients: string[]
          instructions: string[]
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: 'Easy' | 'Medium' | 'Hard' | null
          image_url?: string | null
          category_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ingredients?: string[]
          instructions?: string[]
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: 'Easy' | 'Medium' | 'Hard' | null
          image_url?: string | null
          category_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ratings: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_favorites: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
