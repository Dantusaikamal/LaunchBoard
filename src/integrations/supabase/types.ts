export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apps: {
        Row: {
          backend_url: string | null
          created_at: string
          deployment_url: string | null
          description: string | null
          frontend_url: string | null
          id: string
          logo_url: string | null
          monthly_revenue: number | null
          name: string
          repo_url: string | null
          status: string
          tech_stack: string[] | null
          updated_at: string
          user_id: string
          users_count: number | null
        }
        Insert: {
          backend_url?: string | null
          created_at?: string
          deployment_url?: string | null
          description?: string | null
          frontend_url?: string | null
          id?: string
          logo_url?: string | null
          monthly_revenue?: number | null
          name: string
          repo_url?: string | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id: string
          users_count?: number | null
        }
        Update: {
          backend_url?: string | null
          created_at?: string
          deployment_url?: string | null
          description?: string | null
          frontend_url?: string | null
          id?: string
          logo_url?: string | null
          monthly_revenue?: number | null
          name?: string
          repo_url?: string | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
          user_id?: string
          users_count?: number | null
        }
        Relationships: []
      }
      archive_items: {
        Row: {
          app_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          app_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_items_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          app_id: string
          ci_cd_setup: string | null
          created_at: string
          deployment_url: string | null
          dns_setup: string | null
          domain_name: string | null
          environment: string
          hosting_provider: string
          id: string
          ssl_enabled: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          app_id: string
          ci_cd_setup?: string | null
          created_at?: string
          deployment_url?: string | null
          dns_setup?: string | null
          domain_name?: string | null
          environment: string
          hosting_provider: string
          id?: string
          ssl_enabled?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          ci_cd_setup?: string | null
          created_at?: string
          deployment_url?: string | null
          dns_setup?: string | null
          domain_name?: string | null
          environment?: string
          hosting_provider?: string
          id?: string
          ssl_enabled?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          market_size: string | null
          rating: number | null
          status: string
          tags: string[] | null
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string
          viability_score: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          market_size?: string | null
          rating?: number | null
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id: string
          viability_score?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          market_size?: string | null
          rating?: number | null
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viability_score?: number | null
        }
        Relationships: []
      }
      launches: {
        Row: {
          app_id: string
          assets: Json | null
          channels: string[] | null
          completed: boolean | null
          created_at: string
          id: string
          launch_date: string | null
        }
        Insert: {
          app_id: string
          assets?: Json | null
          channels?: string[] | null
          completed?: boolean | null
          created_at?: string
          id?: string
          launch_date?: string | null
        }
        Update: {
          app_id?: string
          assets?: Json | null
          channels?: string[] | null
          completed?: boolean | null
          created_at?: string
          id?: string
          launch_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launches_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          app_id: string
          content: string
          created_at: string
          id: string
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          type: string
        }
        Insert: {
          app_id: string
          content: string
          created_at?: string
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string
        }
        Update: {
          app_id?: string
          content?: string
          created_at?: string
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenues: {
        Row: {
          app_id: string
          created_at: string
          id: string
          month: string
          refunds: number | null
          source: string | null
          subscribers: number | null
          total_revenue: number | null
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          month: string
          refunds?: number | null
          source?: string | null
          subscribers?: number | null
          total_revenue?: number | null
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          month?: string
          refunds?: number | null
          source?: string | null
          subscribers?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenues_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      secrets: {
        Row: {
          app_id: string
          created_at: string
          description: string | null
          environment: string
          id: string
          is_encrypted: boolean
          last_accessed: string | null
          name: string
          status: string
          updated_at: string
          value: string
        }
        Insert: {
          app_id: string
          created_at?: string
          description?: string | null
          environment: string
          id?: string
          is_encrypted?: boolean
          last_accessed?: string | null
          name: string
          status?: string
          updated_at?: string
          value: string
        }
        Update: {
          app_id?: string
          created_at?: string
          description?: string | null
          environment?: string
          id?: string
          is_encrypted?: boolean
          last_accessed?: string | null
          name?: string
          status?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "secrets_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          app_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          app_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
