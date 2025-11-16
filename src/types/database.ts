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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          requirements: string | null
          location: string | null
          salary_range: string | null
          status: 'OPEN' | 'CLOSED' | 'PAUSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          requirements?: string | null
          location?: string | null
          salary_range?: string | null
          status?: 'OPEN' | 'CLOSED' | 'PAUSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          requirements?: string | null
          location?: string | null
          salary_range?: string | null
          status?: 'OPEN' | 'CLOSED' | 'PAUSED'
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          job_id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          resume_url: string | null
          resume_text: string | null
          ai_score: number | null
          ai_summary: string | null
          status: 'PENDING_REVIEW' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          resume_url?: string | null
          resume_text?: string | null
          ai_score?: number | null
          ai_summary?: string | null
          status?: 'PENDING_REVIEW' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          resume_url?: string | null
          resume_text?: string | null
          ai_score?: number | null
          ai_summary?: string | null
          status?: 'PENDING_REVIEW' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      user_quotas: {
        Row: {
          user_id: string
          ai_credits: number
          used_credits: number
          reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          ai_credits?: number
          used_credits?: number
          reset_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          ai_credits?: number
          used_credits?: number
          reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
