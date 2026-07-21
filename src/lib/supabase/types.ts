// Types générés depuis le schéma Supabase (MCP generate_typescript_types).
// Ne pas éditer à la main : régénérer après toute migration.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      annotations: {
        Row: {
          author_id: string;
          body: string;
          created_at: string | null;
          id: string;
          node_id: string;
          project_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string | null;
          id?: string;
          node_id: string;
          project_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string | null;
          id?: string;
          node_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "annotations_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "annotations_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "breakdown_nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "annotations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      breakdown_nodes: {
        Row: {
          created_at: string | null;
          id: string;
          meta: Json | null;
          name: string;
          parent_id: string | null;
          position: number;
          project_id: string;
          structure: Database["public"]["Enums"]["structure_kind"];
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          meta?: Json | null;
          name: string;
          parent_id?: string | null;
          position?: number;
          project_id: string;
          structure: Database["public"]["Enums"]["structure_kind"];
        };
        Update: {
          created_at?: string | null;
          id?: string;
          meta?: Json | null;
          name?: string;
          parent_id?: string | null;
          position?: number;
          project_id?: string;
          structure?: Database["public"]["Enums"]["structure_kind"];
        };
        Relationships: [
          {
            foreignKeyName: "breakdown_nodes_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "breakdown_nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "breakdown_nodes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      folders: {
        Row: {
          created_at: string | null;
          id: string;
          is_system: boolean | null;
          name: string;
          org_id: string | null;
          owner_id: string;
          parent_id: string | null;
          position: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_system?: boolean | null;
          name: string;
          org_id?: string | null;
          owner_id: string;
          parent_id?: string | null;
          position?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_system?: boolean | null;
          name?: string;
          org_id?: string | null;
          owner_id?: string;
          parent_id?: string | null;
          position?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "folders_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "folders_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "folders_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
        ];
      };
      governance: {
        Row: {
          instances: Json | null;
          project_id: string;
          raci: Json | null;
        };
        Insert: {
          instances?: Json | null;
          project_id: string;
          raci?: Json | null;
        };
        Update: {
          instances?: Json | null;
          project_id?: string;
          raci?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "governance_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          org_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          org_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          org_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          invited_at: string | null;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          user_id: string;
        };
        Insert: {
          invited_at?: string | null;
          project_id: string;
          role?: Database["public"]["Enums"]["project_role"];
          user_id: string;
        };
        Update: {
          invited_at?: string | null;
          project_id?: string;
          role?: Database["public"]["Enums"]["project_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          emoji: string | null;
          folder_id: string | null;
          id: string;
          name: string;
          org_id: string | null;
          owner_id: string;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          emoji?: string | null;
          folder_id?: string | null;
          id?: string;
          name: string;
          org_id?: string | null;
          owner_id: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          emoji?: string | null;
          folder_id?: string | null;
          id?: string;
          name?: string;
          org_id?: string | null;
          owner_id?: string;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sixpack_items: {
        Row: {
          id: string;
          kind: Database["public"]["Enums"]["sixpack_kind"];
          label: string;
          meta: Json | null;
          position: number;
          project_id: string;
        };
        Insert: {
          id?: string;
          kind: Database["public"]["Enums"]["sixpack_kind"];
          label: string;
          meta?: Json | null;
          position?: number;
          project_id: string;
        };
        Update: {
          id?: string;
          kind?: Database["public"]["Enums"]["sixpack_kind"];
          label?: string;
          meta?: Json | null;
          position?: number;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sixpack_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      sixpacks: {
        Row: {
          contexte: string | null;
          contraintes: string | null;
          project_id: string;
        };
        Insert: {
          contexte?: string | null;
          contraintes?: string | null;
          project_id: string;
        };
        Update: {
          contexte?: string | null;
          contraintes?: string | null;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sixpacks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_read_project: { Args: { p: string }; Returns: boolean };
      project_role_of: {
        Args: { p: string };
        Returns: Database["public"]["Enums"]["project_role"];
      };
      seed_examples: { Args: { payload: Json }; Returns: undefined };
    };
    Enums: {
      project_role: "pmo" | "annotator" | "observer";
      project_status: "draft" | "published" | "shared";
      sixpack_kind:
        | "objective"
        | "deliverable"
        | "scope_in"
        | "scope_out"
        | "stakeholder"
        | "milestone";
      structure_kind: "pbs" | "wbs" | "obs";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      project_role: ["pmo", "annotator", "observer"],
      project_status: ["draft", "published", "shared"],
      sixpack_kind: [
        "objective",
        "deliverable",
        "scope_in",
        "scope_out",
        "stakeholder",
        "milestone",
      ],
      structure_kind: ["pbs", "wbs", "obs"],
    },
  },
} as const;
