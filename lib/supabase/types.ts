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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability_rules: {
        Row: {
          end_min: number
          id: string
          position: number
          profile_id: string
          start_min: number
          weekday: number
        }
        Insert: {
          end_min: number
          id?: string
          position?: number
          profile_id: string
          start_min: number
          weekday: number
        }
        Update: {
          end_min?: number
          id?: string
          position?: number
          profile_id?: string
          start_min?: number
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booker_email: string
          booker_name: string
          created_at: string
          duration_minutes: number
          id: string
          message: string
          profile_id: string
          service_external_id: string | null
          service_name: string
          slot_date: string
          start_min: number
          status: string
        }
        Insert: {
          booker_email: string
          booker_name: string
          created_at?: string
          duration_minutes: number
          id?: string
          message?: string
          profile_id: string
          service_external_id?: string | null
          service_name?: string
          slot_date: string
          start_min: number
          status?: string
        }
        Update: {
          booker_email?: string
          booker_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          message?: string
          profile_id?: string
          service_external_id?: string | null
          service_name?: string
          slot_date?: string
          start_min?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      card_links: {
        Row: {
          icon: string
          id: string
          label: string
          position: number
          profile_id: string
          url: string
        }
        Insert: {
          icon?: string
          id?: string
          label: string
          position?: number
          profile_id: string
          url: string
        }
        Update: {
          icon?: string
          id?: string
          label?: string
          position?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          delivered: boolean
          delivery_err: string | null
          id: string
          ip_hash: string | null
          message: string
          profile_id: string
          sender_email: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          delivered?: boolean
          delivery_err?: string | null
          id?: string
          ip_hash?: string | null
          message: string
          profile_id: string
          sender_email: string
          sender_name: string
        }
        Update: {
          created_at?: string
          delivered?: boolean
          delivery_err?: string | null
          id?: string
          ip_hash?: string | null
          message?: string
          profile_id?: string
          sender_email?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_items: {
        Row: {
          blurb: string
          current: boolean
          id: string
          org: string
          period: string
          position: number
          profile_id: string
          role: string
        }
        Insert: {
          blurb?: string
          current?: boolean
          id?: string
          org: string
          period: string
          position?: number
          profile_id: string
          role: string
        }
        Update: {
          blurb?: string
          current?: boolean
          id?: string
          org?: string
          period?: string
          position?: number
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string
          available: boolean
          available_line: string | null
          avatar_url: string | null
          bio: string
          card_cover_url: string | null
          card_style: string
          company: string | null
          cover_image_url: string | null
          created_at: string
          cv_url: string | null
          email_public: string | null
          font_family: string
          full_name: string
          hourly: string | null
          id: string
          initials: string
          is_published: boolean
          languages: string[]
          layout_variant: string
          location: string
          onboarded_at: string | null
          phone_public: string | null
          section_hidden: string[]
          section_order: string[]
          title: string
          updated_at: string
          user_id: string
          username: string
          website: string | null
          whatsapp: string | null
          whatsapp_message: string | null
        }
        Insert: {
          accent_color?: string
          available?: boolean
          available_line?: string | null
          avatar_url?: string | null
          bio?: string
          card_cover_url?: string | null
          card_style?: string
          company?: string | null
          cover_image_url?: string | null
          created_at?: string
          cv_url?: string | null
          email_public?: string | null
          font_family?: string
          full_name: string
          hourly?: string | null
          id?: string
          initials?: string
          is_published?: boolean
          languages?: string[]
          layout_variant?: string
          location?: string
          onboarded_at?: string | null
          phone_public?: string | null
          section_hidden?: string[]
          section_order?: string[]
          title?: string
          updated_at?: string
          user_id: string
          username: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          accent_color?: string
          available?: boolean
          available_line?: string | null
          avatar_url?: string | null
          bio?: string
          card_cover_url?: string | null
          card_style?: string
          company?: string | null
          cover_image_url?: string | null
          created_at?: string
          cv_url?: string | null
          email_public?: string | null
          font_family?: string
          full_name?: string
          hourly?: string | null
          id?: string
          initials?: string
          is_published?: boolean
          languages?: string[]
          layout_variant?: string
          location?: string
          onboarded_at?: string | null
          phone_public?: string | null
          section_hidden?: string[]
          section_order?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          username?: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          blurb: string
          color: string
          github_url: string | null
          highlight: boolean
          id: string
          image_url: string | null
          live_url: string | null
          position: number
          profile_id: string
          stack: string[]
          tag: string
          title: string
        }
        Insert: {
          blurb?: string
          color?: string
          github_url?: string | null
          highlight?: boolean
          id?: string
          image_url?: string | null
          live_url?: string | null
          position?: number
          profile_id: string
          stack?: string[]
          tag?: string
          title: string
        }
        Update: {
          blurb?: string
          color?: string
          github_url?: string | null
          highlight?: boolean
          id?: string
          image_url?: string | null
          live_url?: string | null
          position?: number
          profile_id?: string
          stack?: string[]
          tag?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          blurb: string
          duration_minutes: number | null
          duration_text: string | null
          external_id: string
          id: string
          is_active: boolean
          name: string
          popular: boolean
          position: number
          price: string
          profile_id: string
        }
        Insert: {
          blurb?: string
          duration_minutes?: number | null
          duration_text?: string | null
          external_id: string
          id?: string
          is_active?: boolean
          name: string
          popular?: boolean
          position?: number
          price: string
          profile_id: string
        }
        Update: {
          blurb?: string
          duration_minutes?: number | null
          duration_text?: string | null
          external_id?: string
          id?: string
          is_active?: boolean
          name?: string
          popular?: boolean
          position?: number
          price?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_groups: {
        Row: {
          id: string
          items: string[]
          name: string
          position: number
          profile_id: string
        }
        Insert: {
          id?: string
          items?: string[]
          name: string
          position?: number
          profile_id: string
        }
        Update: {
          id?: string
          items?: string[]
          name?: string
          position?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_groups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          handle: string
          id: string
          kind: string
          label: string | null
          position: number
          profile_id: string
          url: string | null
        }
        Insert: {
          handle: string
          id?: string
          kind: string
          label?: string | null
          position?: number
          profile_id: string
          url?: string | null
        }
        Update: {
          handle?: string
          id?: string
          kind?: string
          label?: string | null
          position?: number
          profile_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author: string
          id: string
          org: string
          position: number
          profile_id: string
          quote: string
        }
        Insert: {
          author: string
          id?: string
          org?: string
          position?: number
          profile_id: string
          quote: string
        }
        Update: {
          author?: string
          id?: string
          org?: string
          position?: number
          profile_id?: string
          quote?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      username_history: {
        Row: {
          changed_at: string
          id: string
          old_username: string
          profile_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          old_username: string
          profile_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          old_username?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "username_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
