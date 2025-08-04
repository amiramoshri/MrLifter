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
      users: {
        Row: {
          id: string
          name: string
          weight: number
          height: number
          age: number | null
          bmi: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          weight: number
          height: number
          age?: number | null
          bmi: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          weight?: number
          height?: number
          age?: number | null
          bmi?: number
          created_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          exercise: string
          weight: number
          sets: number
          reps: number
          notes: string | null
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          exercise: string
          weight: number
          sets: number
          reps: number
          notes?: string | null
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercise?: string
          weight?: number
          sets?: number
          reps?: number
          notes?: string | null
          duration?: number | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_value: number
          current_value: number
          unit: string
          category: 'weight' | 'strength' | 'endurance' | 'body' | 'custom'
          target_date: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_value: number
          current_value?: number
          unit: string
          category: 'weight' | 'strength' | 'endurance' | 'body' | 'custom'
          target_date: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_value?: number
          current_value?: number
          unit?: string
          category?: 'weight' | 'strength' | 'endurance' | 'body' | 'custom'
          target_date?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          thumbnail: string | null
          category: 'exercise' | 'tutorial' | 'motivation' | 'nutrition'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url: string
          thumbnail?: string | null
          category: 'exercise' | 'tutorial' | 'motivation' | 'nutrition'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          thumbnail?: string | null
          category?: 'exercise' | 'tutorial' | 'motivation' | 'nutrition'
          created_at?: string
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
  }
}