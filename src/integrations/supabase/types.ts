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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contest_entries: {
        Row: {
          agreed_to_rules: boolean
          bonus_followed_instagram: boolean
          bonus_shared_story: boolean
          bonus_tagged_account: boolean
          bonus_verified: boolean
          contest_id: string
          created_at: string
          dedupe_override: boolean
          discount_email_sent_at: string | null
          email: string
          email_day1_sent_at: string | null
          email_day14_sent_at: string | null
          email_day21_sent_at: string | null
          email_day3_sent_at: string | null
          email_day30_sent_at: string | null
          email_day45_sent_at: string | null
          email_day7_sent_at: string | null
          event_inquiry_id: string | null
          followup_24h_sent_at: string | null
          followup_48h_sent_at: string | null
          full_name: string
          id: string
          instagram_handle: string | null
          interested_package_category: string | null
          interested_package_name: string | null
          interested_package_price: number | null
          ip_hash: string | null
          is_winner: boolean
          loser_email_sent_at: string | null
          phone: string | null
          sms_day7_sent_at: string | null
          sms_entry_sent_at: string | null
          sms_final_sent_at: string | null
          sms_opt_in: boolean
          sms_winner_sent_at: string | null
          source_page: string
          status: string
          unsubscribe_token: string | null
          unsubscribed_at: string | null
          updated_at: string
          winner_announced_at: string | null
          winner_email_sent_at: string | null
        }
        Insert: {
          agreed_to_rules?: boolean
          bonus_followed_instagram?: boolean
          bonus_shared_story?: boolean
          bonus_tagged_account?: boolean
          bonus_verified?: boolean
          contest_id?: string
          created_at?: string
          dedupe_override?: boolean
          discount_email_sent_at?: string | null
          email: string
          email_day1_sent_at?: string | null
          email_day14_sent_at?: string | null
          email_day21_sent_at?: string | null
          email_day3_sent_at?: string | null
          email_day30_sent_at?: string | null
          email_day45_sent_at?: string | null
          email_day7_sent_at?: string | null
          event_inquiry_id?: string | null
          followup_24h_sent_at?: string | null
          followup_48h_sent_at?: string | null
          full_name: string
          id?: string
          instagram_handle?: string | null
          interested_package_category?: string | null
          interested_package_name?: string | null
          interested_package_price?: number | null
          ip_hash?: string | null
          is_winner?: boolean
          loser_email_sent_at?: string | null
          phone?: string | null
          sms_day7_sent_at?: string | null
          sms_entry_sent_at?: string | null
          sms_final_sent_at?: string | null
          sms_opt_in?: boolean
          sms_winner_sent_at?: string | null
          source_page?: string
          status?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          winner_announced_at?: string | null
          winner_email_sent_at?: string | null
        }
        Update: {
          agreed_to_rules?: boolean
          bonus_followed_instagram?: boolean
          bonus_shared_story?: boolean
          bonus_tagged_account?: boolean
          bonus_verified?: boolean
          contest_id?: string
          created_at?: string
          dedupe_override?: boolean
          discount_email_sent_at?: string | null
          email?: string
          email_day1_sent_at?: string | null
          email_day14_sent_at?: string | null
          email_day21_sent_at?: string | null
          email_day3_sent_at?: string | null
          email_day30_sent_at?: string | null
          email_day45_sent_at?: string | null
          email_day7_sent_at?: string | null
          event_inquiry_id?: string | null
          followup_24h_sent_at?: string | null
          followup_48h_sent_at?: string | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          interested_package_category?: string | null
          interested_package_name?: string | null
          interested_package_price?: number | null
          ip_hash?: string | null
          is_winner?: boolean
          loser_email_sent_at?: string | null
          phone?: string | null
          sms_day7_sent_at?: string | null
          sms_entry_sent_at?: string | null
          sms_final_sent_at?: string | null
          sms_opt_in?: boolean
          sms_winner_sent_at?: string | null
          source_page?: string
          status?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          winner_announced_at?: string | null
          winner_email_sent_at?: string | null
        }
        Relationships: []
      }
      contest_event_inquiries: {
        Row: {
          created_at: string
          entry_id: string | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          interested_package_category: string | null
          interested_package_id: string | null
          interested_package_name: string | null
          interested_package_price: number | null
          special_requests: string | null
          updated_at: string
          venue_location: string | null
        }
        Insert: {
          created_at?: string
          entry_id?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          interested_package_category?: string | null
          interested_package_id?: string | null
          interested_package_name?: string | null
          interested_package_price?: number | null
          special_requests?: string | null
          updated_at?: string
          venue_location?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          interested_package_category?: string | null
          interested_package_id?: string | null
          interested_package_name?: string | null
          interested_package_price?: number | null
          special_requests?: string | null
          updated_at?: string
          venue_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_event_inquiries_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_settings: {
        Row: {
          announcement_date: string | null
          auto_stop_enabled: boolean
          contest_name: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          updated_at: string
          winner_entry_id: string | null
        }
        Insert: {
          announcement_date?: string | null
          auto_stop_enabled?: boolean
          contest_name?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          updated_at?: string
          winner_entry_id?: string | null
        }
        Update: {
          announcement_date?: string | null
          auto_stop_enabled?: boolean
          contest_name?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          updated_at?: string
          winner_entry_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      home_media: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          file_path: string
          id: string
          title: string | null
          type: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          file_path: string
          id?: string
          title?: string | null
          type: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          file_path?: string
          id?: string
          title?: string | null
          type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lesson_access: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_answers: {
        Row: {
          answer_text: string
          created_at: string
          display_order: number
          id: string
          is_correct: boolean
          question_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string
          display_order?: number
          id?: string
          is_correct?: boolean
          question_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          display_order?: number
          id?: string
          is_correct?: boolean
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "lesson_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          lesson_id: string
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          lesson_id: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          lesson_id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_files_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_lessons: {
        Row: {
          additional_notes: string | null
          created_at: string
          description: string | null
          id: string
          lesson_number: number
          module_id: string
          quiz_group: number
          title: string
          updated_at: string
          video_file_path: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_number: number
          module_id: string
          quiz_group?: number
          title: string
          updated_at?: string
          video_file_path?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_number?: number
          module_id?: string
          quiz_group?: number
          title?: string
          updated_at?: string
          video_file_path?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_number: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_number: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          quiz_attempts: number
          quiz_score: number | null
          status: Database["public"]["Enums"]["lesson_status"]
          student_notes: string | null
          updated_at: string
          user_id: string
          video_watched: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          quiz_attempts?: number
          quiz_score?: number | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_notes?: string | null
          updated_at?: string
          user_id: string
          video_watched?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          quiz_attempts?: number
          quiz_score?: number | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_notes?: string | null
          updated_at?: string
          user_id?: string
          video_watched?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_questions: {
        Row: {
          created_at: string
          explanation: string
          id: string
          lesson_id: string
          question_order: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string
          id?: string
          lesson_id: string
          question_order?: number
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          lesson_id?: string
          question_order?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quiz_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string
          id: string
          is_correct: boolean
          lesson_id: string
          question_id: string
          selected_answer_id: string | null
          short_answer_text: string | null
          user_id: string
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          id?: string
          is_correct?: boolean
          lesson_id: string
          question_id: string
          selected_answer_id?: string | null
          short_answer_text?: string | null
          user_id: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          id?: string
          is_correct?: boolean
          lesson_id?: string
          question_id?: string
          selected_answer_id?: string | null
          short_answer_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_quiz_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "lesson_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_quiz_attempts_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "lesson_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      music_requests: {
        Row: {
          artist: string | null
          created_at: string
          id: string
          notes: string | null
          request_type: string
          song_title: string
          user_id: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type: string
          song_title: string
          user_id: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type?: string
          song_title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          changed_by: string | null
          changed_by_email: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          profile_id: string
        }
        Insert: {
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          profile_id: string
        }
        Update: {
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          amount_paid: number
          created_at: string
          deposit_amount: number
          email: string
          event_date: string | null
          event_location: string | null
          event_type: string | null
          first_name: string
          full_amount: number
          id: string
          last_name: string
          notes: string | null
          package_name: string | null
          payment_method: string
          payment_notes: string | null
          payment_status: string
          payment_timestamp: string | null
          payment_verified: boolean
          phone: string | null
          pipeline_stage: string
          pipeline_stage_updated_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          deposit_amount?: number
          email: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          first_name: string
          full_amount?: number
          id?: string
          last_name: string
          notes?: string | null
          package_name?: string | null
          payment_method?: string
          payment_notes?: string | null
          payment_status?: string
          payment_timestamp?: string | null
          payment_verified?: boolean
          phone?: string | null
          pipeline_stage?: string
          pipeline_stage_updated_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          deposit_amount?: number
          email?: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          first_name?: string
          full_amount?: number
          id?: string
          last_name?: string
          notes?: string | null
          package_name?: string | null
          payment_method?: string
          payment_notes?: string | null
          payment_status?: string
          payment_timestamp?: string | null
          payment_verified?: boolean
          phone?: string | null
          pipeline_stage?: string
          pipeline_stage_updated_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_insert_lesson_quizzes: { Args: { _payload: Json }; Returns: number }
      can_edit_payments: { Args: { _user_id: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_admin_area_access: { Args: { _user_id: string }; Returns: boolean }
      has_lesson_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      pipeline_stage_rank: { Args: { _stage: string }; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "finance_manager" | "assistant"
      lesson_status: "not_started" | "in_progress" | "completed"
      question_type: "multiple_choice" | "true_false" | "short_answer"
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
      app_role: ["admin", "user", "finance_manager", "assistant"],
      lesson_status: ["not_started", "in_progress", "completed"],
      question_type: ["multiple_choice", "true_false", "short_answer"],
    },
  },
} as const
