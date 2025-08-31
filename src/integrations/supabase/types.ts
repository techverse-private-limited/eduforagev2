export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_assistant_logs: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          needs_tutor_intervention: boolean | null
          query_text: string
          response_rating: number | null
          student_id: string | null
          user_id: string | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          needs_tutor_intervention?: boolean | null
          query_text: string
          response_rating?: number | null
          student_id?: string | null
          user_id?: string | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          needs_tutor_intervention?: boolean | null
          query_text?: string
          response_rating?: number | null
          student_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_response: {
        Row: {
          created_at: string
          id: number
          responses: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          responses?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          responses?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_summarizer: {
        Row: {
          created_at: string
          id: number
          student_id: string | null
          text: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          student_id?: string | null
          text?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          student_id?: string | null
          text?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          feedback_txt: string
          id: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          feedback_txt: string
          id?: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          feedback_txt?: string
          id?: string
          rating?: number
          student_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          id: string
          rank: number | null
          score: number
          student_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          rank?: number | null
          score?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          rank?: number | null
          score?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          meeting_link: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          student_id: string
          title: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          meeting_link?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          student_id: string
          title?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          meeting_link?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          student_id?: string
          title?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          degree_program: string | null
          email: string | null
          full_name: string | null
          id: string
          learning_speed: string | null
          qualifications: string | null
          reg_no: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          degree_program?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          learning_speed?: string | null
          qualifications?: string | null
          reg_no?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          degree_program?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          learning_speed?: string | null
          qualifications?: string | null
          reg_no?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string
          id: string
          quiz_id: string
          score: number
          student_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          quiz_id: string
          score: number
          student_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          quiz_id?: string
          score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          questions: Json
          topic: string
          tutor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          questions: Json
          topic: string
          tutor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          questions?: Json
          topic?: string
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: Json | null
          best_career_path: string | null
          created_at: string
          id: string
          job_description: string | null
          resume_url: string | null
          skills_needs_to_improve: string | null
          student_id: string
        }
        Insert: {
          ats_score?: Json | null
          best_career_path?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          resume_url?: string | null
          skills_needs_to_improve?: string | null
          student_id: string
        }
        Update: {
          ats_score?: Json | null
          best_career_path?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          resume_url?: string | null
          skills_needs_to_improve?: string | null
          student_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          assigned_tutor_id: string | null
          created_at: string
          current_step: number | null
          duration: unknown | null
          experience_level: string | null
          id: string
          is_verified_by_tutor: boolean | null
          progress_tracking: number | null
          roadmap_json: Json | null
          selected_topics: string[] | null
          student_id: string
          timeframe: string | null
          total_steps: number | null
          track_name: string
        }
        Insert: {
          assigned_tutor_id?: string | null
          created_at?: string
          current_step?: number | null
          duration?: unknown | null
          experience_level?: string | null
          id?: string
          is_verified_by_tutor?: boolean | null
          progress_tracking?: number | null
          roadmap_json?: Json | null
          selected_topics?: string[] | null
          student_id: string
          timeframe?: string | null
          total_steps?: number | null
          track_name: string
        }
        Update: {
          assigned_tutor_id?: string | null
          created_at?: string
          current_step?: number | null
          duration?: unknown | null
          experience_level?: string | null
          id?: string
          is_verified_by_tutor?: boolean | null
          progress_tracking?: number | null
          roadmap_json?: Json | null
          selected_topics?: string[] | null
          student_id?: string
          timeframe?: string | null
          total_steps?: number | null
          track_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_assigned_tutor_id_fkey"
            columns: ["assigned_tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmaps_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          query_text: string
          status: Database["public"]["Enums"]["ticket_status"]
          student_id: string
          tutor_id: string | null
          tutor_response: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          query_text: string
          status?: Database["public"]["Enums"]["ticket_status"]
          student_id: string
          tutor_id?: string | null
          tutor_response?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          query_text?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          student_id?: string
          tutor_id?: string | null
          tutor_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_feedback: {
        Row: {
          created_at: string
          feedback_text: string
          id: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          feedback_text: string
          id?: string
          rating: number
          student_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string
          id?: string
          rating?: number
          student_id?: string
          tutor_id?: string
        }
        Relationships: []
      }
      tutor_verification_requests: {
        Row: {
          created_at: string
          full_name: string
          id: string
          qualifications: string
          resume_url: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          qualifications: string
          resume_url: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          qualifications?: string
          resume_url?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_custom_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      meeting_status: "scheduled" | "in-progress" | "completed" | "cancelled"
      ticket_status: "open" | "in_progress" | "resolved"
      user_role: "student" | "teacher" | "admin" | "tutor"
      verification_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      meeting_status: ["scheduled", "in-progress", "completed", "cancelled"],
      ticket_status: ["open", "in_progress", "resolved"],
      user_role: ["student", "teacher", "admin", "tutor"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
