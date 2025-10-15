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
          email: string
          google_refresh_token: string | null
          google_access_token: string | null
          token_expires_at: string | null
          calendar_sync_enabled: boolean
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          google_refresh_token?: string | null
          google_access_token?: string | null
          token_expires_at?: string | null
          calendar_sync_enabled?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          google_refresh_token?: string | null
          google_access_token?: string | null
          token_expires_at?: string | null
          calendar_sync_enabled?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          google_event_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          timezone: string
          meeting_link: string | null
          status: 'upcoming' | 'in_progress' | 'completed'
          attendees: Json
          recording_status: 'none' | 'pending' | 'recording' | 'completed' | 'failed'
          fireflies_transcript_id: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_event_id: string
          title: string
          description?: string
          start_time: string
          end_time: string
          timezone?: string
          meeting_link?: string | null
          status?: 'upcoming' | 'in_progress' | 'completed'
          attendees?: Json
          recording_status?: 'none' | 'pending' | 'recording' | 'completed' | 'failed'
          fireflies_transcript_id?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_event_id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          timezone?: string
          meeting_link?: string | null
          status?: 'upcoming' | 'in_progress' | 'completed'
          attendees?: Json
          recording_status?: 'none' | 'pending' | 'recording' | 'completed' | 'failed'
          fireflies_transcript_id?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      recording_sessions: {
        Row: {
          id: string
          meeting_id: string
          fireflies_bot_invited_at: string
          recording_started_at: string | null
          recording_stopped_at: string | null
          status: 'inviting' | 'recording' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          transcript_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          fireflies_bot_invited_at?: string
          recording_started_at?: string | null
          recording_stopped_at?: string | null
          status?: 'inviting' | 'recording' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          transcript_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          fireflies_bot_invited_at?: string
          recording_started_at?: string | null
          recording_stopped_at?: string | null
          status?: 'inviting' | 'recording' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          transcript_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

export interface Attendee {
  email: string
  name?: string
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  avatar?: string
}

export interface Meeting {
  id: string
  user_id: string
  google_event_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  timezone: string
  meeting_link: string | null
  status: 'upcoming' | 'in_progress' | 'completed'
  attendees: Attendee[]
  recording_status: 'none' | 'pending' | 'recording' | 'completed' | 'failed'
  fireflies_transcript_id: string | null
  notes: string
  created_at: string
  updated_at: string
}
