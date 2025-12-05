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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_boosts: {
        Row: {
          auto_renew: boolean | null
          clicks_count: number | null
          created_at: string | null
          credit_transaction_id: string | null
          end_date: string
          id: string
          package_id: string
          payment_id: string | null
          payment_method: string | null
          profile_id: string
          start_date: string
          status: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          auto_renew?: boolean | null
          clicks_count?: number | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date: string
          id?: string
          package_id: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id: string
          start_date?: string
          status?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          auto_renew?: boolean | null
          clicks_count?: number | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date?: string
          id?: string
          package_id?: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id?: string
          start_date?: string
          status?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "active_boosts_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_boosts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "boost_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_boosts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_geographic_boosts: {
        Row: {
          clicks_count: number | null
          created_at: string | null
          credit_transaction_id: string | null
          end_date: string
          geographic_boost_id: string
          id: string
          payment_id: string | null
          payment_method: string | null
          profile_id: string
          start_date: string
          status: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          clicks_count?: number | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date: string
          geographic_boost_id: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id: string
          start_date?: string
          status?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          clicks_count?: number | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date?: string
          geographic_boost_id?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id?: string
          start_date?: string
          status?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "active_geographic_boosts_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_geographic_boosts_geographic_boost_id_fkey"
            columns: ["geographic_boost_id"]
            isOneToOne: false
            referencedRelation: "geographic_boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_geographic_boosts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_premium_services: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          credit_transaction_id: string | null
          end_date: string | null
          id: string
          profile_id: string
          service_id: string
          start_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date?: string | null
          id?: string
          profile_id: string
          service_id: string
          start_date?: string
          status?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          credit_transaction_id?: string | null
          end_date?: string | null
          id?: string
          profile_id?: string
          service_id?: string
          start_date?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_premium_services_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_premium_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_premium_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "premium_services"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_login_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at: string | null
          id: string
          referral_id: string
          status: string | null
          transaction_amount: number
          transaction_id: string
          transaction_type: string
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          id?: string
          referral_id: string
          status?: string | null
          transaction_amount: number
          transaction_id: string
          transaction_type: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          referral_id?: string
          status?: string | null
          transaction_amount?: number
          transaction_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          bank_info: Json | null
          created_at: string | null
          id: string
          notes: string | null
          payout_method: string
          pix_key: string | null
          processed_at: string | null
          proof_url: string | null
          status: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          bank_info?: Json | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payout_method: string
          pix_key?: string | null
          processed_at?: string | null
          proof_url?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          bank_info?: Json | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payout_method?: string
          pix_key?: string | null
          processed_at?: string | null
          proof_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          first_transaction_at: string | null
          id: string
          referred_at: string | null
          referred_user_id: string
          status: string | null
          total_commission_earned: number | null
          total_revenue_generated: number | null
          total_transactions: number | null
        }
        Insert: {
          affiliate_id: string
          first_transaction_at?: string | null
          id?: string
          referred_at?: string | null
          referred_user_id: string
          status?: string | null
          total_commission_earned?: number | null
          total_revenue_generated?: number | null
          total_transactions?: number | null
        }
        Update: {
          affiliate_id?: string
          first_transaction_at?: string | null
          id?: string
          referred_at?: string | null
          referred_user_id?: string
          status?: string | null
          total_commission_earned?: number | null
          total_revenue_generated?: number | null
          total_transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_tiers: {
        Row: {
          benefits: Json | null
          bonus_rate: number
          commission_rate: number
          created_at: string | null
          id: string
          min_referrals: number
          min_revenue: number
          name: string
          sort_order: number | null
        }
        Insert: {
          benefits?: Json | null
          bonus_rate?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          min_referrals?: number
          min_revenue?: number
          name: string
          sort_order?: number | null
        }
        Update: {
          benefits?: Json | null
          bonus_rate?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          min_referrals?: number
          min_revenue?: number
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          affiliate_code: string
          affiliate_link: string
          bank_info: Json | null
          commission_rate: number
          created_at: string | null
          id: string
          pending_payout: number | null
          pix_key: string | null
          status: string | null
          tier_level: string | null
          total_earned: number | null
          total_paid_out: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code: string
          affiliate_link: string
          bank_info?: Json | null
          commission_rate?: number
          created_at?: string | null
          id?: string
          pending_payout?: number | null
          pix_key?: string | null
          status?: string | null
          tier_level?: string | null
          total_earned?: number | null
          total_paid_out?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string
          affiliate_link?: string
          bank_info?: Json | null
          commission_rate?: number
          created_at?: string | null
          id?: string
          pending_payout?: number | null
          pix_key?: string | null
          status?: string | null
          tier_level?: string | null
          total_earned?: number | null
          total_paid_out?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          duration_hours: number | null
          id: string
          notes: string | null
          profile_id: string
          service_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          notes?: string | null
          profile_id: string
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          notes?: string | null
          profile_id?: string
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_renewal_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_renewal_date: string | null
          next_renewal_date: string | null
          package_id: string | null
          payment_method: string | null
          profile_id: string | null
          renewal_count: number | null
          renewal_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_renewal_date?: string | null
          next_renewal_date?: string | null
          package_id?: string | null
          payment_method?: string | null
          profile_id?: string | null
          renewal_count?: number | null
          renewal_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_renewal_date?: string | null
          next_renewal_date?: string | null
          package_id?: string | null
          payment_method?: string | null
          profile_id?: string | null
          renewal_count?: number | null
          renewal_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_renewal_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_packages: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          created_at: string | null
          credit_cost: number | null
          duration_hours: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          priority_score: number | null
          sort_order: number | null
          visibility_multiplier: number
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string | null
          credit_cost?: number | null
          duration_hours: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          priority_score?: number | null
          sort_order?: number | null
          visibility_multiplier: number
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string | null
          credit_cost?: number | null
          duration_hours?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          priority_score?: number | null
          sort_order?: number | null
          visibility_multiplier?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cities_seo: {
        Row: {
          canonical_url: string | null
          city_name: string
          city_slug: string
          created_at: string
          id: string
          is_active: boolean | null
          is_neighborhood: boolean | null
          meta_description: string | null
          meta_title: string | null
          parent_city_slug: string | null
          state_code: string
          state_name: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          city_name: string
          city_slug: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_neighborhood?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          parent_city_slug?: string | null
          state_code: string
          state_name: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          city_name?: string
          city_slug?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_neighborhood?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          parent_city_slug?: string | null
          state_code?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_tip: boolean | null
          profile_id: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
          tip_amount: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_tip?: boolean | null
          profile_id?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
          tip_amount?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_tip?: boolean | null
          profile_id?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          tip_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string
          id: string
          payment_id: string | null
          payment_method: string | null
          plan_id: string
          start_date: string
          status: string
          subscriber_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id: string
          start_date?: string
          status?: string
          subscriber_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          subscriber_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "client_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          block_type: string
          content: string | null
          created_at: string
          id: string
          is_active: boolean | null
          key: string
          page: string | null
          title: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          key: string
          page?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          key?: string
          page?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_comments: {
        Row: {
          comment_text: string
          content_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_text: string
          content_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string
          content_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "exclusive_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_protection_settings: {
        Row: {
          created_at: string | null
          download_prevention_enabled: boolean | null
          id: string
          profile_id: string
          screenshot_detection_enabled: boolean | null
          updated_at: string | null
          watermark_enabled: boolean | null
          watermark_opacity: number | null
          watermark_text: string | null
        }
        Insert: {
          created_at?: string | null
          download_prevention_enabled?: boolean | null
          id?: string
          profile_id: string
          screenshot_detection_enabled?: boolean | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
          watermark_opacity?: number | null
          watermark_text?: string | null
        }
        Update: {
          created_at?: string | null
          download_prevention_enabled?: boolean | null
          id?: string
          profile_id?: string
          screenshot_detection_enabled?: boolean | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
          watermark_opacity?: number | null
          watermark_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_protection_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reactions: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "exclusive_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string
          id: string
          payment_id: string | null
          payment_method: string | null
          profile_id: string
          start_date: string | null
          status: string
          subscriber_id: string
          tier_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id: string
          start_date?: string | null
          status?: string
          subscriber_id: string
          tier_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          profile_id?: string
          start_date?: string | null
          status?: string
          subscriber_id?: string
          tier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_views: {
        Row: {
          content_id: string
          id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          content_id: string
          id?: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          content_id?: string
          id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "exclusive_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_violation_logs: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          user_id: string
          violation_type: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          user_id: string
          violation_type: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_violation_logs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "exclusive_content"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          profile_id: string
          unread_count: number | null
          updated_at: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          profile_id: string
          unread_count?: number | null
          updated_at?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          profile_id?: string
          unread_count?: number | null
          updated_at?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_earnings: {
        Row: {
          created_at: string | null
          id: string
          last_payout_date: string | null
          paid_out: number | null
          pending_payout: number | null
          platform_fee_total: number | null
          profile_id: string
          total_earned: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_payout_date?: string | null
          paid_out?: number | null
          pending_payout?: number | null
          platform_fee_total?: number | null
          profile_id: string
          total_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_payout_date?: string | null
          paid_out?: number | null
          pending_payout?: number | null
          platform_fee_total?: number | null
          profile_id?: string
          total_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payouts: {
        Row: {
          amount: number
          id: string
          notes: string | null
          pix_key: string
          processed_at: string | null
          profile_id: string
          proof_url: string | null
          requested_at: string | null
          status: string
        }
        Insert: {
          amount: number
          id?: string
          notes?: string | null
          pix_key: string
          processed_at?: string | null
          profile_id: string
          proof_url?: string | null
          requested_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          id?: string
          notes?: string | null
          pix_key?: string
          processed_at?: string | null
          profile_id?: string
          proof_url?: string | null
          requested_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          bonus_credits: number | null
          created_at: string | null
          credits: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
        }
        Insert: {
          bonus_credits?: number | null
          created_at?: string | null
          credits: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
        }
        Update: {
          bonus_credits?: number | null
          created_at?: string | null
          credits?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          payment_id: string | null
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          created_at: string | null
          credit_reward: number
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          mission_type: string
          name: string
          target_value: number | null
        }
        Insert: {
          created_at?: string | null
          credit_reward: number
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          mission_type: string
          name: string
          target_value?: number | null
        }
        Update: {
          created_at?: string | null
          credit_reward?: number
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          mission_type?: string
          name?: string
          target_value?: number | null
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          applicable_to: string
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_to: string
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until: string
        }
        Update: {
          applicable_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      dynamic_pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ethnicities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      exclusive_content: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_preview: boolean | null
          media_type: string
          media_url: string
          profile_id: string
          required_tier_id: string | null
          thumbnail_url: string | null
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_preview?: boolean | null
          media_type: string
          media_url: string
          profile_id: string
          required_tier_id?: string | null
          thumbnail_url?: string | null
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_preview?: boolean | null
          media_type?: string
          media_url?: string
          profile_id?: string
          required_tier_id?: string | null
          thumbnail_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exclusive_content_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_content_required_tier_id_fkey"
            columns: ["required_tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          profile_id: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          profile_id?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          profile_id?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_boosts: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          city_name: string | null
          city_slug: string | null
          created_at: string | null
          credit_cost: number | null
          description: string | null
          duration_hours: number
          geographic_type: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          neighborhood: string | null
          price: number | null
          priority_score: number
          sort_order: number | null
          state_code: string | null
          state_name: string | null
          updated_at: string | null
          visibility_multiplier: number
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          city_name?: string | null
          city_slug?: string | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          duration_hours?: number
          geographic_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          neighborhood?: string | null
          price?: number | null
          priority_score?: number
          sort_order?: number | null
          state_code?: string | null
          state_name?: string | null
          updated_at?: string | null
          visibility_multiplier?: number
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          city_name?: string | null
          city_slug?: string | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          duration_hours?: number
          geographic_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          neighborhood?: string | null
          price?: number | null
          priority_score?: number
          sort_order?: number | null
          state_code?: string | null
          state_name?: string | null
          updated_at?: string | null
          visibility_multiplier?: number
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          cashback_percentage: number | null
          created_at: string | null
          discount_percentage: number | null
          id: string
          points: number | null
          tier: string | null
          total_cashback_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cashback_percentage?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          points?: number | null
          tier?: string | null
          total_cashback_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cashback_percentage?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          points?: number | null
          tier?: string | null
          total_cashback_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          label: string
          menu_type: string
          parent_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label: string
          menu_type: string
          parent_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label?: string
          menu_type?: string
          parent_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_profiles: {
        Row: {
          age: number
          availability: string[] | null
          available_hours: string[] | null
          body_type: string | null
          category: string
          city: string
          created_at: string
          description: string | null
          ethnicity: string | null
          eye_color: string | null
          featured: boolean | null
          hair_color: string | null
          height: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          name: string
          neighborhoods: string[] | null
          phone: string | null
          photo_url: string | null
          photos: string[] | null
          price: number
          pricing: Json | null
          primary_neighborhood_slug: string | null
          rejection_reason: string | null
          services: string[] | null
          slug: string
          state: string
          telegram: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          videos: string[] | null
          weight: number | null
          whatsapp: string | null
        }
        Insert: {
          age: number
          availability?: string[] | null
          available_hours?: string[] | null
          body_type?: string | null
          category?: string
          city: string
          created_at?: string
          description?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          hair_color?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          name: string
          neighborhoods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          photos?: string[] | null
          price: number
          pricing?: Json | null
          primary_neighborhood_slug?: string | null
          rejection_reason?: string | null
          services?: string[] | null
          slug: string
          state: string
          telegram?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          videos?: string[] | null
          weight?: number | null
          whatsapp?: string | null
        }
        Update: {
          age?: number
          availability?: string[] | null
          available_hours?: string[] | null
          body_type?: string | null
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          hair_color?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          name?: string
          neighborhoods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          photos?: string[] | null
          price?: number
          pricing?: Json | null
          primary_neighborhood_slug?: string | null
          rejection_reason?: string | null
          services?: string[] | null
          slug?: string
          state?: string
          telegram?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          videos?: string[] | null
          weight?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monetization_bundles: {
        Row: {
          badge_color: string | null
          badge_text: string | null
          bundle_price: number
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          included_items: Json
          is_active: boolean | null
          name: string
          original_price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          bundle_price: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          included_items?: Json
          is_active?: boolean | null
          name: string
          original_price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          bundle_price?: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          included_items?: Json
          is_active?: boolean | null
          name?: string
          original_price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          city_slug: string
          created_at: string
          id: string
          is_active: boolean | null
          is_main: boolean | null
          neighborhood_name: string
          neighborhood_slug: string
          state_code: string
          updated_at: string
        }
        Insert: {
          city_slug: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          neighborhood_name: string
          neighborhood_slug: string
          state_code: string
          updated_at?: string
        }
        Update: {
          city_slug?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          neighborhood_name?: string
          neighborhood_slug?: string
          state_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_ads: {
        Row: {
          ad_description: string | null
          ad_image_url: string | null
          ad_title: string
          clicks: number | null
          company_name: string
          contact_email: string
          created_at: string | null
          end_date: string
          id: string
          impressions: number | null
          is_active: boolean | null
          monthly_price: number
          placement: string | null
          start_date: string
          target_categories: string[] | null
          target_cities: string[] | null
          target_states: string[] | null
          target_url: string | null
        }
        Insert: {
          ad_description?: string | null
          ad_image_url?: string | null
          ad_title: string
          clicks?: number | null
          company_name: string
          contact_email: string
          created_at?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          monthly_price: number
          placement?: string | null
          start_date: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_states?: string[] | null
          target_url?: string | null
        }
        Update: {
          ad_description?: string | null
          ad_image_url?: string | null
          ad_title?: string
          clicks?: number | null
          company_name?: string
          contact_email?: string
          created_at?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          monthly_price?: number
          placement?: string | null
          start_date?: string
          target_categories?: string[] | null
          target_cities?: string[] | null
          target_states?: string[] | null
          target_url?: string | null
        }
        Relationships: []
      }
      ppv_content: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          price: number
          profile_id: string
          purchase_count: number | null
          thumbnail_url: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          price: number
          profile_id: string
          purchase_count?: number | null
          thumbnail_url?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          price?: number
          profile_id?: string
          purchase_count?: number | null
          thumbnail_url?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ppv_content_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppv_purchases: {
        Row: {
          id: string
          payment_id: string | null
          payment_method: string | null
          ppv_content_id: string
          price_paid: number
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          ppv_content_id: string
          price_paid: number
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          ppv_content_id?: string
          price_paid?: number
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppv_purchases_ppv_content_id_fkey"
            columns: ["ppv_content_id"]
            isOneToOne: false
            referencedRelation: "ppv_content"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_plans: {
        Row: {
          advanced_analytics: boolean | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          max_active_boosts: number | null
          max_photos: number | null
          monthly_credits: number | null
          name: string
          price: number
          priority_support: boolean | null
        }
        Insert: {
          advanced_analytics?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_active_boosts?: number | null
          max_photos?: number | null
          monthly_credits?: number | null
          name: string
          price: number
          priority_support?: boolean | null
        }
        Update: {
          advanced_analytics?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_active_boosts?: number | null
          max_photos?: number | null
          monthly_credits?: number | null
          name?: string
          price?: number
          priority_support?: boolean | null
        }
        Relationships: []
      }
      premium_services: {
        Row: {
          config: Json | null
          created_at: string | null
          credit_cost: number
          description: string | null
          duration_days: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          service_type: string
          sort_order: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credit_cost: number
          description?: string | null
          duration_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          service_type: string
          sort_order?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          duration_days?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          service_type?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          plan_id: string
          profile_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id: string
          profile_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          plan_id?: string
          profile_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_verifications: {
        Row: {
          created_at: string | null
          id: string
          price_paid: number
          profile_id: string
          status: string | null
          user_id: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_paid: number
          profile_id: string
          status?: string | null
          user_id: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_paid?: number
          profile_id?: string
          status?: string | null
          user_id?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_analytics: {
        Row: {
          clicks: number | null
          created_at: string | null
          date: string
          favorites: number | null
          hour: number | null
          id: string
          messages: number | null
          profile_id: string
          source: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          date?: string
          favorites?: number | null
          hour?: number | null
          id?: string
          messages?: number | null
          profile_id: string
          source?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          date?: string
          favorites?: number | null
          hour?: number | null
          id?: string
          messages?: number | null
          profile_id?: string
          source?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_leads: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contacted_at: string | null
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          source: string
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          source?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          source?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          profile_id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          profile_id: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          profile_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_stats: {
        Row: {
          clicks: number | null
          created_at: string | null
          favorites: number | null
          id: string
          messages: number | null
          profile_id: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          favorites?: number | null
          id?: string
          messages?: number | null
          profile_id: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          favorites?: number | null
          id?: string
          messages?: number | null
          profile_id?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          profile_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type: string
          media_url: string
          profile_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          profile_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          reported_profile_id: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          reported_profile_id: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          reported_profile_id?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_content: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_content_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "exclusive_content"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      story_reactions: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reaction_type: string
          story_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reaction_type: string
          story_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reaction_type?: string
          story_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "profile_stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_reactions_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "profile_stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string | null
          creator_amount: number
          id: string
          payment_id: string | null
          platform_fee: number
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          creator_amount: number
          id?: string
          payment_id?: string | null
          platform_fee: number
          status?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          creator_amount?: number
          id?: string
          payment_id?: string | null
          platform_fee?: number
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "content_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          benefits: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          monthly_price: number
          profile_id: string
          sort_order: number | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price: number
          profile_id: string
          sort_order?: number | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_price?: number
          profile_id?: string
          sort_order?: number | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tiers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          report_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          report_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          report_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          date: string | null
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          date?: string | null
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          date?: string | null
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "daily_missions"
            referencedColumns: ["id"]
          },
        ]
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
      verification_requests: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          profile_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          profile_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          profile_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
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
      generate_profile_slug: {
        Args: { profile_id: string; profile_name: string }
        Returns: string
      }
      generate_ticket_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_story_views: {
        Args: { story_uuid: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "model" | "visitor"
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
      app_role: ["admin", "model", "visitor"],
    },
  },
} as const
