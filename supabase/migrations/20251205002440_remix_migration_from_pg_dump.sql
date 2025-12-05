CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'model',
    'visitor'
);


--
-- Name: auto_generate_profile_slug(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_profile_slug() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Se slug não foi fornecido ou está vazio, gerar automaticamente
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_profile_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: generate_profile_slug(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_profile_slug(profile_name text, profile_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Normalizar nome para slug (remover acentos, espaços, caracteres especiais)
  base_slug := lower(regexp_replace(
    unaccent(profile_name),
    '[^a-z0-9]+', '-', 'g'
  ));
  -- Remover hífens no início e fim
  base_slug := trim(both '-' from base_slug);
  
  -- Se o slug ficou vazio, usar um padrão genérico
  IF base_slug = '' THEN
    base_slug := 'perfil';
  END IF;
  
  final_slug := base_slug;
  
  -- Verificar unicidade e adicionar contador se necessário
  WHILE EXISTS (SELECT 1 FROM model_profiles WHERE slug = final_slug AND id != profile_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


--
-- Name: generate_ticket_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_ticket_number() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  ticket_count INTEGER;
  new_number TEXT;
BEGIN
  SELECT COUNT(*) INTO ticket_count FROM public.support_tickets;
  new_number := 'TICKET-' || LPAD((ticket_count + 1)::TEXT, 6, '0');
  RETURN new_number;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'visitor'
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: increment_story_views(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_story_views(story_uuid uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profile_stories
  SET view_count = view_count + 1
  WHERE id = story_uuid;
END;
$$;


--
-- Name: update_affiliates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_affiliates_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_auto_renewal_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_auto_renewal_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_categories_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_categories_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_cities_seo_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_cities_seo_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_client_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_client_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_content_blocks_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_content_blocks_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_content_comments_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_content_comments_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_content_protection_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_content_protection_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_content_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_content_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_creator_earnings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_creator_earnings_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_dynamic_pages_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_dynamic_pages_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_integration_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_integration_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;


--
-- Name: update_neighborhoods_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_neighborhoods_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_reports_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reports_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_subscription_tiers_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_subscription_tiers_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_support_tickets_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_support_tickets_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_user_credits_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_credits_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_verification_requests_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_verification_requests_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: active_boosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_boosts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    package_id uuid NOT NULL,
    start_date timestamp with time zone DEFAULT now() NOT NULL,
    end_date timestamp with time zone NOT NULL,
    views_count integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    payment_method text,
    payment_id text,
    credit_transaction_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    auto_renew boolean DEFAULT false
);


--
-- Name: active_geographic_boosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_geographic_boosts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    geographic_boost_id uuid NOT NULL,
    start_date timestamp with time zone DEFAULT now() NOT NULL,
    end_date timestamp with time zone NOT NULL,
    views_count integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    payment_id text,
    payment_method text,
    credit_transaction_id uuid,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT active_geographic_boosts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: active_premium_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_premium_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    service_id uuid NOT NULL,
    start_date timestamp with time zone DEFAULT now() NOT NULL,
    end_date timestamp with time zone,
    status text DEFAULT 'active'::text,
    credit_transaction_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    auto_renew boolean DEFAULT false
);


--
-- Name: admin_login_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_login_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    email text NOT NULL,
    success boolean NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: affiliate_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    referral_id uuid NOT NULL,
    transaction_type text NOT NULL,
    transaction_id uuid NOT NULL,
    transaction_amount numeric NOT NULL,
    commission_rate numeric NOT NULL,
    commission_amount numeric NOT NULL,
    status text DEFAULT 'approved'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affiliate_commissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text])))
);


--
-- Name: affiliate_payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    amount numeric NOT NULL,
    payout_method text NOT NULL,
    pix_key text,
    bank_info jsonb,
    status text DEFAULT 'pending'::text,
    processed_at timestamp with time zone,
    proof_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affiliate_payouts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: affiliate_referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    affiliate_id uuid NOT NULL,
    referred_user_id uuid NOT NULL,
    referred_at timestamp with time zone DEFAULT now(),
    first_transaction_at timestamp with time zone,
    total_transactions integer DEFAULT 0,
    total_revenue_generated numeric DEFAULT 0,
    total_commission_earned numeric DEFAULT 0,
    status text DEFAULT 'pending'::text,
    CONSTRAINT affiliate_referrals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'churned'::text])))
);


--
-- Name: affiliate_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    min_referrals integer DEFAULT 0 NOT NULL,
    min_revenue numeric DEFAULT 0 NOT NULL,
    commission_rate numeric DEFAULT 0 NOT NULL,
    bonus_rate numeric DEFAULT 0 NOT NULL,
    benefits jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: affiliates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    affiliate_code text NOT NULL,
    affiliate_link text NOT NULL,
    commission_rate numeric DEFAULT 10 NOT NULL,
    tier_level text DEFAULT 'bronze'::text,
    total_earned numeric DEFAULT 0,
    pending_payout numeric DEFAULT 0,
    total_paid_out numeric DEFAULT 0,
    status text DEFAULT 'active'::text,
    pix_key text,
    bank_info jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affiliates_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])))
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_name text,
    client_phone text,
    client_email text,
    appointment_date timestamp with time zone NOT NULL,
    duration_hours integer DEFAULT 1,
    service_type text,
    notes text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: auto_renewal_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_renewal_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid,
    renewal_type text NOT NULL,
    package_id uuid,
    is_enabled boolean DEFAULT true,
    payment_method text DEFAULT 'credits'::text,
    last_renewal_date timestamp with time zone,
    next_renewal_date timestamp with time zone,
    renewal_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT auto_renewal_settings_payment_method_check CHECK ((payment_method = ANY (ARRAY['credits'::text, 'money'::text]))),
    CONSTRAINT auto_renewal_settings_renewal_type_check CHECK ((renewal_type = ANY (ARRAY['boost'::text, 'premium_service'::text, 'geographic_boost'::text])))
);


--
-- Name: boost_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boost_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    duration_hours integer NOT NULL,
    visibility_multiplier numeric(4,2) NOT NULL,
    price numeric(10,2),
    credit_cost integer,
    features jsonb DEFAULT '[]'::jsonb,
    badge_text text,
    badge_color text,
    priority_score integer DEFAULT 0,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cities_seo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities_seo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    state_code text NOT NULL,
    state_name text NOT NULL,
    city_name text NOT NULL,
    city_slug text NOT NULL,
    meta_title text,
    meta_description text,
    canonical_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_neighborhood boolean DEFAULT false,
    parent_city_slug text
);


--
-- Name: client_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    profile_id uuid,
    content text NOT NULL,
    is_tip boolean DEFAULT false,
    tip_amount numeric(10,2),
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.client_messages REPLICA IDENTITY FULL;


--
-- Name: client_subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    duration_days integer NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscriber_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    start_date timestamp with time zone DEFAULT now() NOT NULL,
    end_date timestamp with time zone NOT NULL,
    payment_id text,
    payment_method text DEFAULT 'mercadopago'::text,
    auto_renew boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT client_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])))
);


--
-- Name: content_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    content text,
    block_type text DEFAULT 'text'::text NOT NULL,
    page text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: content_protection_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_protection_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    watermark_enabled boolean DEFAULT true,
    watermark_text text,
    watermark_opacity numeric DEFAULT 0.5,
    screenshot_detection_enabled boolean DEFAULT true,
    download_prevention_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_protection_settings_watermark_opacity_check CHECK (((watermark_opacity >= (0)::numeric) AND (watermark_opacity <= (1)::numeric)))
);


--
-- Name: content_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_reactions_reaction_type_check CHECK ((reaction_type = ANY (ARRAY['like'::text, 'love'::text, 'fire'::text, 'star'::text])))
);


--
-- Name: content_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscriber_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    tier_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone NOT NULL,
    auto_renew boolean DEFAULT true,
    payment_method text DEFAULT 'mercadopago'::text,
    payment_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'pending'::text])))
);


--
-- Name: content_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    viewer_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now()
);


--
-- Name: content_violation_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_violation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    user_id uuid NOT NULL,
    violation_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_violation_logs_violation_type_check CHECK ((violation_type = ANY (ARRAY['screenshot'::text, 'download_attempt'::text, 'copy_attempt'::text])))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    visitor_id uuid NOT NULL,
    last_message_at timestamp with time zone DEFAULT now(),
    unread_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: creator_earnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_earnings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    total_earned numeric DEFAULT 0,
    platform_fee_total numeric DEFAULT 0,
    pending_payout numeric DEFAULT 0,
    paid_out numeric DEFAULT 0,
    last_payout_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT creator_earnings_paid_out_check CHECK ((paid_out >= (0)::numeric)),
    CONSTRAINT creator_earnings_pending_payout_check CHECK ((pending_payout >= (0)::numeric)),
    CONSTRAINT creator_earnings_platform_fee_total_check CHECK ((platform_fee_total >= (0)::numeric)),
    CONSTRAINT creator_earnings_total_earned_check CHECK ((total_earned >= (0)::numeric))
);


--
-- Name: creator_payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creator_payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    pix_key text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    proof_url text,
    notes text,
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    CONSTRAINT creator_payouts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'rejected'::text])))
);


--
-- Name: credit_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    credits integer NOT NULL,
    bonus_credits integer DEFAULT 0,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    transaction_type text NOT NULL,
    description text NOT NULL,
    reference_id uuid,
    payment_id text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    mission_type text NOT NULL,
    credit_reward integer NOT NULL,
    target_value integer DEFAULT 1,
    icon text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: discount_coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount_coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    applicable_to text NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    valid_from timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    CONSTRAINT discount_coupons_applicable_to_check CHECK ((applicable_to = ANY (ARRAY['plans'::text, 'boosts'::text, 'credits'::text, 'all'::text]))),
    CONSTRAINT discount_coupons_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text]))),
    CONSTRAINT discount_coupons_discount_value_check CHECK ((discount_value > (0)::numeric))
);


--
-- Name: dynamic_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dynamic_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text,
    meta_title text,
    meta_description text,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published_at timestamp with time zone
);


--
-- Name: ethnicities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ethnicities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: exclusive_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exclusive_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    media_type text NOT NULL,
    media_url text NOT NULL,
    thumbnail_url text,
    caption text,
    is_preview boolean DEFAULT false,
    required_tier_id uuid,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT exclusive_content_media_type_check CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text])))
);


--
-- Name: feed_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feed_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    viewer_id uuid,
    interaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT feed_interactions_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['view'::text, 'favorite'::text, 'profile_visit'::text, 'message'::text])))
);


--
-- Name: geographic_boosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geographic_boosts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    geographic_type text NOT NULL,
    state_code text,
    state_name text,
    city_slug text,
    city_name text,
    neighborhood text,
    duration_hours integer DEFAULT 24 NOT NULL,
    visibility_multiplier numeric DEFAULT 2.0 NOT NULL,
    priority_score integer DEFAULT 100 NOT NULL,
    price numeric,
    credit_cost integer,
    badge_text text,
    badge_color text,
    icon text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT geographic_boosts_geographic_type_check CHECK ((geographic_type = ANY (ARRAY['state'::text, 'city'::text, 'neighborhood'::text])))
);


--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text,
    description text,
    is_encrypted boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);


--
-- Name: loyalty_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tier text DEFAULT 'bronze'::text,
    points integer DEFAULT 0,
    cashback_percentage integer DEFAULT 0,
    discount_percentage integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    total_cashback_earned numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT loyalty_rewards_tier_check CHECK ((tier = ANY (ARRAY['bronze'::text, 'silver'::text, 'gold'::text, 'platinum'::text])))
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_type text NOT NULL,
    label text NOT NULL,
    url text NOT NULL,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: model_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    age integer NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    category text DEFAULT 'mulheres'::text NOT NULL,
    description text,
    price integer NOT NULL,
    phone text,
    whatsapp text,
    telegram text,
    height integer,
    weight integer,
    eye_color text,
    hair_color text,
    services text[] DEFAULT '{}'::text[],
    availability text[] DEFAULT '{}'::text[],
    neighborhoods text[] DEFAULT '{}'::text[],
    photo_url text,
    photos text[] DEFAULT '{}'::text[],
    verified boolean DEFAULT false,
    featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pricing jsonb DEFAULT '{"hourly": null, "full_day": null, "overnight": null, "half_period": null}'::jsonb,
    available_hours text[] DEFAULT ARRAY[]::text[],
    body_type text,
    ethnicity text,
    moderation_status text DEFAULT 'pending'::text,
    rejection_reason text,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    slug text NOT NULL,
    videos text[] DEFAULT '{}'::text[],
    primary_neighborhood_slug text,
    CONSTRAINT city_slug_format_check CHECK ((city ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
    CONSTRAINT model_profiles_moderation_status_check CHECK ((moderation_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT state_format_check CHECK ((state ~ '^[A-Z]{2}$'::text))
);


--
-- Name: monetization_bundles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monetization_bundles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    included_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    original_price numeric NOT NULL,
    bundle_price numeric NOT NULL,
    discount_percentage integer,
    badge_text text,
    badge_color text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    city_slug text NOT NULL,
    state_code text NOT NULL,
    neighborhood_name text NOT NULL,
    neighborhood_slug text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_main boolean DEFAULT false
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: partner_ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    contact_email text NOT NULL,
    ad_title text NOT NULL,
    ad_description text,
    ad_image_url text,
    target_url text,
    target_states text[],
    target_cities text[],
    target_categories text[],
    placement text,
    monthly_price numeric NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT partner_ads_placement_check CHECK ((placement = ANY (ARRAY['sidebar'::text, 'feed'::text, 'profile_page'::text])))
);


--
-- Name: ppv_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppv_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    media_type text NOT NULL,
    media_url text NOT NULL,
    thumbnail_url text,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    is_active boolean DEFAULT true,
    view_count integer DEFAULT 0,
    purchase_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ppv_content_media_type_check CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text]))),
    CONSTRAINT ppv_content_price_check CHECK ((price > (0)::numeric))
);


--
-- Name: ppv_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppv_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ppv_content_id uuid NOT NULL,
    price_paid numeric NOT NULL,
    payment_id text,
    payment_method text DEFAULT 'mercadopago'::text,
    purchased_at timestamp with time zone DEFAULT now()
);


--
-- Name: premium_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration_days integer NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    monthly_credits integer DEFAULT 0,
    discount_percentage integer DEFAULT 0,
    max_active_boosts integer DEFAULT 1,
    priority_support boolean DEFAULT false,
    advanced_analytics boolean DEFAULT false,
    max_photos integer DEFAULT 10
);


--
-- Name: premium_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    credit_cost integer NOT NULL,
    duration_days integer,
    service_type text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb,
    icon text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: premium_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid,
    plan_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    payment_id text,
    payment_method text DEFAULT 'mercadopago'::text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    auto_renew boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT premium_subscriptions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: premium_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    verification_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    verified_at timestamp with time zone,
    price_paid numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT premium_verifications_verification_type_check CHECK ((verification_type = ANY (ARRAY['video_call'::text, 'professional_photoshoot'::text, 'background_check'::text, 'social_media_link'::text])))
);


--
-- Name: profile_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    hour integer,
    views integer DEFAULT 0,
    clicks integer DEFAULT 0,
    favorites integer DEFAULT 0,
    messages integer DEFAULT 0,
    source text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profile_analytics_hour_check CHECK (((hour >= 0) AND (hour <= 23)))
);


--
-- Name: profile_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    user_id uuid NOT NULL,
    contact_name text,
    contact_phone text,
    contact_email text,
    source text DEFAULT 'whatsapp'::text NOT NULL,
    notes text,
    tags text[] DEFAULT '{}'::text[],
    status text DEFAULT 'new'::text,
    contacted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profile_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    user_id uuid,
    rating integer NOT NULL,
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profile_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: profile_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    views integer DEFAULT 0,
    clicks integer DEFAULT 0,
    favorites integer DEFAULT 0,
    messages integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profile_stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    media_url text NOT NULL,
    media_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT profile_stories_media_type_check CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    role text DEFAULT 'visitor'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid,
    reported_profile_id uuid NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reports_category_check CHECK ((category = ANY (ARRAY['inappropriate_content'::text, 'fake_profile'::text, 'spam'::text, 'harassment'::text, 'underage'::text, 'other'::text]))),
    CONSTRAINT reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'under_review'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: saved_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: seo_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seo_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: story_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    viewer_id uuid,
    reaction_type text NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT story_reactions_reaction_type_check CHECK ((reaction_type = ANY (ARRAY['like'::text, 'love'::text, 'fire'::text, 'clap'::text, 'message'::text])))
);


--
-- Name: story_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    viewer_id uuid,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subscription_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscription_id uuid NOT NULL,
    amount numeric NOT NULL,
    platform_fee numeric NOT NULL,
    creator_amount numeric NOT NULL,
    payment_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])))
);


--
-- Name: subscription_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    tier_name text NOT NULL,
    monthly_price numeric NOT NULL,
    description text,
    benefits jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_tiers_monthly_price_check CHECK ((monthly_price >= (0)::numeric))
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number text NOT NULL,
    user_id uuid,
    assigned_to uuid,
    subject text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    report_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id uuid,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    total_earned integer DEFAULT 0 NOT NULL,
    total_spent integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_mission_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_mission_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mission_id uuid NOT NULL,
    current_value integer DEFAULT 0,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    document_type text NOT NULL,
    document_url text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT verification_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: active_boosts active_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_boosts
    ADD CONSTRAINT active_boosts_pkey PRIMARY KEY (id);


--
-- Name: active_geographic_boosts active_geographic_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_geographic_boosts
    ADD CONSTRAINT active_geographic_boosts_pkey PRIMARY KEY (id);


--
-- Name: active_premium_services active_premium_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_premium_services
    ADD CONSTRAINT active_premium_services_pkey PRIMARY KEY (id);


--
-- Name: admin_login_attempts admin_login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_login_attempts
    ADD CONSTRAINT admin_login_attempts_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: affiliate_commissions affiliate_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_pkey PRIMARY KEY (id);


--
-- Name: affiliate_payouts affiliate_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_payouts
    ADD CONSTRAINT affiliate_payouts_pkey PRIMARY KEY (id);


--
-- Name: affiliate_referrals affiliate_referrals_affiliate_id_referred_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_affiliate_id_referred_user_id_key UNIQUE (affiliate_id, referred_user_id);


--
-- Name: affiliate_referrals affiliate_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_pkey PRIMARY KEY (id);


--
-- Name: affiliate_tiers affiliate_tiers_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_tiers
    ADD CONSTRAINT affiliate_tiers_name_key UNIQUE (name);


--
-- Name: affiliate_tiers affiliate_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_tiers
    ADD CONSTRAINT affiliate_tiers_pkey PRIMARY KEY (id);


--
-- Name: affiliates affiliates_affiliate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_affiliate_code_key UNIQUE (affiliate_code);


--
-- Name: affiliates affiliates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_pkey PRIMARY KEY (id);


--
-- Name: affiliates affiliates_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_user_id_key UNIQUE (user_id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: auto_renewal_settings auto_renewal_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_renewal_settings
    ADD CONSTRAINT auto_renewal_settings_pkey PRIMARY KEY (id);


--
-- Name: auto_renewal_settings auto_renewal_settings_user_id_profile_id_renewal_type_packa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_renewal_settings
    ADD CONSTRAINT auto_renewal_settings_user_id_profile_id_renewal_type_packa_key UNIQUE (user_id, profile_id, renewal_type, package_id);


--
-- Name: boost_packages boost_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boost_packages
    ADD CONSTRAINT boost_packages_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: cities_seo cities_seo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities_seo
    ADD CONSTRAINT cities_seo_pkey PRIMARY KEY (id);


--
-- Name: cities_seo cities_seo_state_code_city_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities_seo
    ADD CONSTRAINT cities_seo_state_code_city_slug_key UNIQUE (state_code, city_slug);


--
-- Name: client_messages client_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_pkey PRIMARY KEY (id);


--
-- Name: client_subscription_plans client_subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_subscription_plans
    ADD CONSTRAINT client_subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: client_subscriptions client_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_subscriptions
    ADD CONSTRAINT client_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: content_blocks content_blocks_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_key_key UNIQUE (key);


--
-- Name: content_blocks content_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_pkey PRIMARY KEY (id);


--
-- Name: content_comments content_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_comments
    ADD CONSTRAINT content_comments_pkey PRIMARY KEY (id);


--
-- Name: content_protection_settings content_protection_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_protection_settings
    ADD CONSTRAINT content_protection_settings_pkey PRIMARY KEY (id);


--
-- Name: content_protection_settings content_protection_settings_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_protection_settings
    ADD CONSTRAINT content_protection_settings_profile_id_key UNIQUE (profile_id);


--
-- Name: content_reactions content_reactions_content_id_user_id_reaction_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reactions
    ADD CONSTRAINT content_reactions_content_id_user_id_reaction_type_key UNIQUE (content_id, user_id, reaction_type);


--
-- Name: content_reactions content_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reactions
    ADD CONSTRAINT content_reactions_pkey PRIMARY KEY (id);


--
-- Name: content_subscriptions content_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_subscriptions
    ADD CONSTRAINT content_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: content_views content_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_views
    ADD CONSTRAINT content_views_pkey PRIMARY KEY (id);


--
-- Name: content_violation_logs content_violation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_violation_logs
    ADD CONSTRAINT content_violation_logs_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: creator_earnings creator_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_earnings
    ADD CONSTRAINT creator_earnings_pkey PRIMARY KEY (id);


--
-- Name: creator_earnings creator_earnings_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_earnings
    ADD CONSTRAINT creator_earnings_profile_id_key UNIQUE (profile_id);


--
-- Name: creator_payouts creator_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_payouts
    ADD CONSTRAINT creator_payouts_pkey PRIMARY KEY (id);


--
-- Name: credit_packages credit_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_packages
    ADD CONSTRAINT credit_packages_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: daily_missions daily_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_missions
    ADD CONSTRAINT daily_missions_pkey PRIMARY KEY (id);


--
-- Name: discount_coupons discount_coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_coupons
    ADD CONSTRAINT discount_coupons_code_key UNIQUE (code);


--
-- Name: discount_coupons discount_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_coupons
    ADD CONSTRAINT discount_coupons_pkey PRIMARY KEY (id);


--
-- Name: dynamic_pages dynamic_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dynamic_pages
    ADD CONSTRAINT dynamic_pages_pkey PRIMARY KEY (id);


--
-- Name: dynamic_pages dynamic_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dynamic_pages
    ADD CONSTRAINT dynamic_pages_slug_key UNIQUE (slug);


--
-- Name: ethnicities ethnicities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_name_key UNIQUE (name);


--
-- Name: ethnicities ethnicities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_pkey PRIMARY KEY (id);


--
-- Name: exclusive_content exclusive_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exclusive_content
    ADD CONSTRAINT exclusive_content_pkey PRIMARY KEY (id);


--
-- Name: feed_interactions feed_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_interactions
    ADD CONSTRAINT feed_interactions_pkey PRIMARY KEY (id);


--
-- Name: geographic_boosts geographic_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geographic_boosts
    ADD CONSTRAINT geographic_boosts_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_key_key UNIQUE (key);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: loyalty_rewards loyalty_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_pkey PRIMARY KEY (id);


--
-- Name: loyalty_rewards loyalty_rewards_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_user_id_key UNIQUE (user_id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: model_profiles model_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_profiles
    ADD CONSTRAINT model_profiles_pkey PRIMARY KEY (id);


--
-- Name: model_profiles model_profiles_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_profiles
    ADD CONSTRAINT model_profiles_slug_unique UNIQUE (slug);


--
-- Name: monetization_bundles monetization_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monetization_bundles
    ADD CONSTRAINT monetization_bundles_pkey PRIMARY KEY (id);


--
-- Name: neighborhoods neighborhoods_city_slug_state_code_neighborhood_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_city_slug_state_code_neighborhood_slug_key UNIQUE (city_slug, state_code, neighborhood_slug);


--
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partner_ads partner_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_ads
    ADD CONSTRAINT partner_ads_pkey PRIMARY KEY (id);


--
-- Name: ppv_content ppv_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_content
    ADD CONSTRAINT ppv_content_pkey PRIMARY KEY (id);


--
-- Name: ppv_purchases ppv_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_purchases
    ADD CONSTRAINT ppv_purchases_pkey PRIMARY KEY (id);


--
-- Name: ppv_purchases ppv_purchases_user_id_ppv_content_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_purchases
    ADD CONSTRAINT ppv_purchases_user_id_ppv_content_id_key UNIQUE (user_id, ppv_content_id);


--
-- Name: premium_plans premium_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_plans
    ADD CONSTRAINT premium_plans_pkey PRIMARY KEY (id);


--
-- Name: premium_services premium_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_services
    ADD CONSTRAINT premium_services_pkey PRIMARY KEY (id);


--
-- Name: premium_subscriptions premium_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_subscriptions
    ADD CONSTRAINT premium_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: premium_verifications premium_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_verifications
    ADD CONSTRAINT premium_verifications_pkey PRIMARY KEY (id);


--
-- Name: profile_analytics profile_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_analytics
    ADD CONSTRAINT profile_analytics_pkey PRIMARY KEY (id);


--
-- Name: profile_leads profile_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_leads
    ADD CONSTRAINT profile_leads_pkey PRIMARY KEY (id);


--
-- Name: profile_reviews profile_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_reviews
    ADD CONSTRAINT profile_reviews_pkey PRIMARY KEY (id);


--
-- Name: profile_stats profile_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_stats
    ADD CONSTRAINT profile_stats_pkey PRIMARY KEY (id);


--
-- Name: profile_stories profile_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_stories
    ADD CONSTRAINT profile_stories_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: saved_content saved_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_content
    ADD CONSTRAINT saved_content_pkey PRIMARY KEY (id);


--
-- Name: saved_content saved_content_user_id_content_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_content
    ADD CONSTRAINT saved_content_user_id_content_id_key UNIQUE (user_id, content_id);


--
-- Name: seo_settings seo_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_settings
    ADD CONSTRAINT seo_settings_key_key UNIQUE (key);


--
-- Name: seo_settings seo_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_settings
    ADD CONSTRAINT seo_settings_pkey PRIMARY KEY (id);


--
-- Name: story_reactions story_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_reactions
    ADD CONSTRAINT story_reactions_pkey PRIMARY KEY (id);


--
-- Name: story_views story_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_pkey PRIMARY KEY (id);


--
-- Name: story_views story_views_story_id_viewer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_viewer_id_key UNIQUE (story_id, viewer_id);


--
-- Name: subscription_payments subscription_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT subscription_payments_pkey PRIMARY KEY (id);


--
-- Name: subscription_tiers subscription_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_tiers
    ADD CONSTRAINT subscription_tiers_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: user_mission_progress user_mission_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mission_progress
    ADD CONSTRAINT user_mission_progress_pkey PRIMARY KEY (id);


--
-- Name: user_mission_progress user_mission_progress_user_id_mission_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mission_progress
    ADD CONSTRAINT user_mission_progress_user_id_mission_id_date_key UNIQUE (user_id, mission_id, date);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- Name: verification_requests verification_requests_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_profile_id_key UNIQUE (profile_id);


--
-- Name: idx_admin_login_attempts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_login_attempts_created_at ON public.admin_login_attempts USING btree (created_at DESC);


--
-- Name: idx_admin_login_attempts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_login_attempts_email ON public.admin_login_attempts USING btree (email);


--
-- Name: idx_admin_logs_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_admin_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_created_at ON public.admin_logs USING btree (created_at DESC);


--
-- Name: idx_admin_logs_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_resource ON public.admin_logs USING btree (resource_type, resource_id);


--
-- Name: idx_affiliates_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_code ON public.affiliates USING btree (affiliate_code);


--
-- Name: idx_affiliates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_status ON public.affiliates USING btree (status);


--
-- Name: idx_affiliates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affiliates_user_id ON public.affiliates USING btree (user_id);


--
-- Name: idx_appointments_profile_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_profile_date ON public.appointments USING btree (profile_id, appointment_date DESC);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_cities_seo_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_seo_slug ON public.cities_seo USING btree (city_slug);


--
-- Name: idx_cities_seo_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_seo_state ON public.cities_seo USING btree (state_code);


--
-- Name: idx_client_messages_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_messages_profile ON public.client_messages USING btree (profile_id);


--
-- Name: idx_client_messages_receiver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_messages_receiver ON public.client_messages USING btree (receiver_id);


--
-- Name: idx_client_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_messages_sender ON public.client_messages USING btree (sender_id);


--
-- Name: idx_client_messages_sender_receiver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_messages_sender_receiver ON public.client_messages USING btree (sender_id, receiver_id, created_at DESC);


--
-- Name: idx_client_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_messages_unread ON public.client_messages USING btree (receiver_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_client_subscriptions_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_subscriptions_end_date ON public.client_subscriptions USING btree (end_date);


--
-- Name: idx_client_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_subscriptions_status ON public.client_subscriptions USING btree (status);


--
-- Name: idx_client_subscriptions_subscriber; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_subscriptions_subscriber ON public.client_subscriptions USING btree (subscriber_id);


--
-- Name: idx_commissions_affiliate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commissions_affiliate_id ON public.affiliate_commissions USING btree (affiliate_id);


--
-- Name: idx_commissions_referral_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commissions_referral_id ON public.affiliate_commissions USING btree (referral_id);


--
-- Name: idx_commissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commissions_status ON public.affiliate_commissions USING btree (status);


--
-- Name: idx_content_blocks_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_blocks_key ON public.content_blocks USING btree (key);


--
-- Name: idx_content_comments_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_comments_content ON public.content_comments USING btree (content_id);


--
-- Name: idx_content_comments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_comments_user ON public.content_comments USING btree (user_id);


--
-- Name: idx_content_reactions_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_reactions_content ON public.content_reactions USING btree (content_id);


--
-- Name: idx_content_reactions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_reactions_user ON public.content_reactions USING btree (user_id);


--
-- Name: idx_content_subscriptions_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_subscriptions_profile ON public.content_subscriptions USING btree (profile_id);


--
-- Name: idx_content_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_subscriptions_status ON public.content_subscriptions USING btree (status);


--
-- Name: idx_content_subscriptions_subscriber; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_subscriptions_subscriber ON public.content_subscriptions USING btree (subscriber_id);


--
-- Name: idx_content_views_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_views_content ON public.content_views USING btree (content_id);


--
-- Name: idx_conversations_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_profile ON public.conversations USING btree (profile_id, last_message_at DESC);


--
-- Name: idx_conversations_visitor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_visitor ON public.conversations USING btree (visitor_id, last_message_at DESC);


--
-- Name: idx_creator_earnings_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_creator_earnings_profile ON public.creator_earnings USING btree (profile_id);


--
-- Name: idx_discount_coupons_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discount_coupons_active ON public.discount_coupons USING btree (is_active);


--
-- Name: idx_discount_coupons_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discount_coupons_code ON public.discount_coupons USING btree (code);


--
-- Name: idx_discount_coupons_valid_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discount_coupons_valid_dates ON public.discount_coupons USING btree (valid_from, valid_until);


--
-- Name: idx_dynamic_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dynamic_pages_slug ON public.dynamic_pages USING btree (slug);


--
-- Name: idx_exclusive_content_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exclusive_content_profile ON public.exclusive_content USING btree (profile_id);


--
-- Name: idx_feed_interactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feed_interactions_created_at ON public.feed_interactions USING btree (created_at DESC);


--
-- Name: idx_feed_interactions_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feed_interactions_profile_id ON public.feed_interactions USING btree (profile_id);


--
-- Name: idx_feed_interactions_viewer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_feed_interactions_viewer_id ON public.feed_interactions USING btree (viewer_id);


--
-- Name: idx_menu_items_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_type ON public.menu_items USING btree (menu_type);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at DESC);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (is_read) WHERE (is_read = false);


--
-- Name: idx_model_profiles_moderation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_profiles_moderation_status ON public.model_profiles USING btree (moderation_status);


--
-- Name: idx_model_profiles_primary_neighborhood; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_profiles_primary_neighborhood ON public.model_profiles USING btree (primary_neighborhood_slug);


--
-- Name: idx_model_profiles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_profiles_slug ON public.model_profiles USING btree (slug);


--
-- Name: idx_model_profiles_videos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_model_profiles_videos ON public.model_profiles USING gin (videos) WHERE ((videos IS NOT NULL) AND (array_length(videos, 1) > 0));


--
-- Name: idx_neighborhoods_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_neighborhoods_active ON public.neighborhoods USING btree (is_active);


--
-- Name: idx_neighborhoods_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_neighborhoods_city ON public.neighborhoods USING btree (city_slug, state_code);


--
-- Name: idx_neighborhoods_is_main; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_neighborhoods_is_main ON public.neighborhoods USING btree (is_main) WHERE (is_main = true);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_payouts_affiliate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_affiliate_id ON public.affiliate_payouts USING btree (affiliate_id);


--
-- Name: idx_payouts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_status ON public.affiliate_payouts USING btree (status);


--
-- Name: idx_ppv_content_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppv_content_profile ON public.ppv_content USING btree (profile_id);


--
-- Name: idx_ppv_purchases_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppv_purchases_content ON public.ppv_purchases USING btree (ppv_content_id);


--
-- Name: idx_ppv_purchases_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ppv_purchases_user ON public.ppv_purchases USING btree (user_id);


--
-- Name: idx_premium_subscriptions_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_subscriptions_profile_id ON public.premium_subscriptions USING btree (profile_id);


--
-- Name: idx_premium_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_subscriptions_status ON public.premium_subscriptions USING btree (status);


--
-- Name: idx_premium_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_subscriptions_user_id ON public.premium_subscriptions USING btree (user_id);


--
-- Name: idx_profile_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_analytics_date ON public.profile_analytics USING btree (date DESC);


--
-- Name: idx_profile_analytics_profile_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_analytics_profile_date ON public.profile_analytics USING btree (profile_id, date DESC);


--
-- Name: idx_profile_analytics_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_analytics_source ON public.profile_analytics USING btree (source);


--
-- Name: idx_profile_leads_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_leads_profile_id ON public.profile_leads USING btree (profile_id);


--
-- Name: idx_profile_leads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_leads_status ON public.profile_leads USING btree (status);


--
-- Name: idx_profile_leads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_leads_user_id ON public.profile_leads USING btree (user_id);


--
-- Name: idx_profile_stats_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_stats_profile_id ON public.profile_stats USING btree (profile_id);


--
-- Name: idx_profile_stories_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_stories_expires_at ON public.profile_stories USING btree (expires_at);


--
-- Name: idx_profile_stories_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profile_stories_profile_id ON public.profile_stories USING btree (profile_id);


--
-- Name: idx_referrals_affiliate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_affiliate_id ON public.affiliate_referrals USING btree (affiliate_id);


--
-- Name: idx_referrals_referred_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referred_user ON public.affiliate_referrals USING btree (referred_user_id);


--
-- Name: idx_reports_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_created_at ON public.reports USING btree (created_at DESC);


--
-- Name: idx_reports_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_profile ON public.reports USING btree (reported_profile_id);


--
-- Name: idx_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_status ON public.reports USING btree (status);


--
-- Name: idx_reviews_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created ON public.profile_reviews USING btree (created_at DESC);


--
-- Name: idx_reviews_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_profile ON public.profile_reviews USING btree (profile_id);


--
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user ON public.profile_reviews USING btree (user_id);


--
-- Name: idx_saved_content_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_content_content_id ON public.saved_content USING btree (content_id);


--
-- Name: idx_saved_content_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saved_content_user_id ON public.saved_content USING btree (user_id);


--
-- Name: idx_story_reactions_story_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_reactions_story_id ON public.story_reactions USING btree (story_id);


--
-- Name: idx_story_reactions_viewer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_reactions_viewer_id ON public.story_reactions USING btree (viewer_id);


--
-- Name: idx_story_views_story_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_views_story_id ON public.story_views USING btree (story_id);


--
-- Name: idx_subscription_payments_subscription; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscription_payments_subscription ON public.subscription_payments USING btree (subscription_id);


--
-- Name: idx_subscription_tiers_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscription_tiers_profile ON public.subscription_tiers USING btree (profile_id);


--
-- Name: idx_support_tickets_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets USING btree (assigned_to);


--
-- Name: idx_support_tickets_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_created_at ON public.support_tickets USING btree (created_at DESC);


--
-- Name: idx_support_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_support_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets USING btree (user_id);


--
-- Name: idx_ticket_messages_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages USING btree (ticket_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_violation_logs_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_violation_logs_content ON public.content_violation_logs USING btree (content_id);


--
-- Name: idx_violation_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_violation_logs_user ON public.content_violation_logs USING btree (user_id);


--
-- Name: model_profiles trigger_auto_slug; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_slug BEFORE INSERT OR UPDATE ON public.model_profiles FOR EACH ROW EXECUTE FUNCTION public.auto_generate_profile_slug();


--
-- Name: affiliates update_affiliates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.update_affiliates_updated_at();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: auto_renewal_settings update_auto_renewal_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_auto_renewal_settings_updated_at BEFORE UPDATE ON public.auto_renewal_settings FOR EACH ROW EXECUTE FUNCTION public.update_auto_renewal_settings_updated_at();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_categories_updated_at();


--
-- Name: cities_seo update_cities_seo_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cities_seo_updated_at BEFORE UPDATE ON public.cities_seo FOR EACH ROW EXECUTE FUNCTION public.update_cities_seo_updated_at();


--
-- Name: client_subscriptions update_client_subscriptions_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_subscriptions_updated_at_trigger BEFORE UPDATE ON public.client_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_client_subscriptions_updated_at();


--
-- Name: content_blocks update_content_blocks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON public.content_blocks FOR EACH ROW EXECUTE FUNCTION public.update_content_blocks_updated_at();


--
-- Name: content_comments update_content_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_comments_updated_at BEFORE UPDATE ON public.content_comments FOR EACH ROW EXECUTE FUNCTION public.update_content_comments_updated_at();


--
-- Name: content_protection_settings update_content_protection_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_protection_settings_updated_at BEFORE UPDATE ON public.content_protection_settings FOR EACH ROW EXECUTE FUNCTION public.update_content_protection_settings_updated_at();


--
-- Name: content_subscriptions update_content_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_subscriptions_updated_at BEFORE UPDATE ON public.content_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_content_subscriptions_updated_at();


--
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: creator_earnings update_creator_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_creator_earnings_updated_at BEFORE UPDATE ON public.creator_earnings FOR EACH ROW EXECUTE FUNCTION public.update_creator_earnings_updated_at();


--
-- Name: discount_coupons update_discount_coupons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_discount_coupons_updated_at BEFORE UPDATE ON public.discount_coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dynamic_pages update_dynamic_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_dynamic_pages_updated_at BEFORE UPDATE ON public.dynamic_pages FOR EACH ROW EXECUTE FUNCTION public.update_dynamic_pages_updated_at();


--
-- Name: geographic_boosts update_geographic_boosts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_geographic_boosts_updated_at BEFORE UPDATE ON public.geographic_boosts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: integration_settings update_integration_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON public.integration_settings FOR EACH ROW EXECUTE FUNCTION public.update_integration_settings_updated_at();


--
-- Name: loyalty_rewards update_loyalty_rewards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON public.loyalty_rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: model_profiles update_model_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_model_profiles_updated_at BEFORE UPDATE ON public.model_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: monetization_bundles update_monetization_bundles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_monetization_bundles_updated_at BEFORE UPDATE ON public.monetization_bundles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: neighborhoods update_neighborhoods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON public.neighborhoods FOR EACH ROW EXECUTE FUNCTION public.update_neighborhoods_updated_at();


--
-- Name: premium_subscriptions update_premium_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_premium_subscriptions_updated_at BEFORE UPDATE ON public.premium_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profile_analytics update_profile_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profile_analytics_updated_at BEFORE UPDATE ON public.profile_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profile_leads update_profile_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profile_leads_updated_at BEFORE UPDATE ON public.profile_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profile_reviews update_profile_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profile_reviews_updated_at BEFORE UPDATE ON public.profile_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profile_stats update_profile_stats_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profile_stats_updated_at BEFORE UPDATE ON public.profile_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reports update_reports_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reports_updated_at_trigger BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_reports_updated_at();


--
-- Name: subscription_tiers update_subscription_tiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON public.subscription_tiers FOR EACH ROW EXECUTE FUNCTION public.update_subscription_tiers_updated_at();


--
-- Name: support_tickets update_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_support_tickets_updated_at();


--
-- Name: user_credits update_user_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_user_credits_updated_at();


--
-- Name: verification_requests verification_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER verification_requests_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION public.update_verification_requests_updated_at();


--
-- Name: active_boosts active_boosts_credit_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_boosts
    ADD CONSTRAINT active_boosts_credit_transaction_id_fkey FOREIGN KEY (credit_transaction_id) REFERENCES public.credit_transactions(id);


--
-- Name: active_boosts active_boosts_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_boosts
    ADD CONSTRAINT active_boosts_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.boost_packages(id);


--
-- Name: active_boosts active_boosts_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_boosts
    ADD CONSTRAINT active_boosts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: active_boosts active_boosts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_boosts
    ADD CONSTRAINT active_boosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: active_geographic_boosts active_geographic_boosts_credit_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_geographic_boosts
    ADD CONSTRAINT active_geographic_boosts_credit_transaction_id_fkey FOREIGN KEY (credit_transaction_id) REFERENCES public.credit_transactions(id);


--
-- Name: active_geographic_boosts active_geographic_boosts_geographic_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_geographic_boosts
    ADD CONSTRAINT active_geographic_boosts_geographic_boost_id_fkey FOREIGN KEY (geographic_boost_id) REFERENCES public.geographic_boosts(id) ON DELETE CASCADE;


--
-- Name: active_geographic_boosts active_geographic_boosts_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_geographic_boosts
    ADD CONSTRAINT active_geographic_boosts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: active_premium_services active_premium_services_credit_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_premium_services
    ADD CONSTRAINT active_premium_services_credit_transaction_id_fkey FOREIGN KEY (credit_transaction_id) REFERENCES public.credit_transactions(id);


--
-- Name: active_premium_services active_premium_services_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_premium_services
    ADD CONSTRAINT active_premium_services_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: active_premium_services active_premium_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_premium_services
    ADD CONSTRAINT active_premium_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.premium_services(id);


--
-- Name: active_premium_services active_premium_services_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_premium_services
    ADD CONSTRAINT active_premium_services_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_login_attempts admin_login_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_login_attempts
    ADD CONSTRAINT admin_login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: affiliate_commissions affiliate_commissions_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_commissions affiliate_commissions_referral_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_commissions
    ADD CONSTRAINT affiliate_commissions_referral_id_fkey FOREIGN KEY (referral_id) REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE;


--
-- Name: affiliate_payouts affiliate_payouts_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_payouts
    ADD CONSTRAINT affiliate_payouts_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_referrals affiliate_referrals_affiliate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE CASCADE;


--
-- Name: affiliate_referrals affiliate_referrals_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_referrals
    ADD CONSTRAINT affiliate_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: affiliates affiliates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliates
    ADD CONSTRAINT affiliates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: auto_renewal_settings auto_renewal_settings_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_renewal_settings
    ADD CONSTRAINT auto_renewal_settings_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: client_messages client_messages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: client_messages client_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_messages client_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_subscriptions client_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_subscriptions
    ADD CONSTRAINT client_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.client_subscription_plans(id) ON DELETE CASCADE;


--
-- Name: content_comments content_comments_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_comments
    ADD CONSTRAINT content_comments_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.exclusive_content(id) ON DELETE CASCADE;


--
-- Name: content_comments content_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_comments
    ADD CONSTRAINT content_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_protection_settings content_protection_settings_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_protection_settings
    ADD CONSTRAINT content_protection_settings_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: content_reactions content_reactions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reactions
    ADD CONSTRAINT content_reactions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.exclusive_content(id) ON DELETE CASCADE;


--
-- Name: content_reactions content_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reactions
    ADD CONSTRAINT content_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_subscriptions content_subscriptions_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_subscriptions
    ADD CONSTRAINT content_subscriptions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: content_subscriptions content_subscriptions_subscriber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_subscriptions
    ADD CONSTRAINT content_subscriptions_subscriber_id_fkey FOREIGN KEY (subscriber_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_subscriptions content_subscriptions_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_subscriptions
    ADD CONSTRAINT content_subscriptions_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.subscription_tiers(id) ON DELETE RESTRICT;


--
-- Name: content_views content_views_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_views
    ADD CONSTRAINT content_views_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.exclusive_content(id) ON DELETE CASCADE;


--
-- Name: content_views content_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_views
    ADD CONSTRAINT content_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_violation_logs content_violation_logs_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_violation_logs
    ADD CONSTRAINT content_violation_logs_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.exclusive_content(id) ON DELETE CASCADE;


--
-- Name: content_violation_logs content_violation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_violation_logs
    ADD CONSTRAINT content_violation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: creator_earnings creator_earnings_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_earnings
    ADD CONSTRAINT creator_earnings_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: creator_payouts creator_payouts_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creator_payouts
    ADD CONSTRAINT creator_payouts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: discount_coupons discount_coupons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_coupons
    ADD CONSTRAINT discount_coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: exclusive_content exclusive_content_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exclusive_content
    ADD CONSTRAINT exclusive_content_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: exclusive_content exclusive_content_required_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exclusive_content
    ADD CONSTRAINT exclusive_content_required_tier_id_fkey FOREIGN KEY (required_tier_id) REFERENCES public.subscription_tiers(id) ON DELETE SET NULL;


--
-- Name: feed_interactions feed_interactions_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_interactions
    ADD CONSTRAINT feed_interactions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: feed_interactions feed_interactions_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_interactions
    ADD CONSTRAINT feed_interactions_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: integration_settings integration_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: model_profiles model_profiles_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_profiles
    ADD CONSTRAINT model_profiles_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES auth.users(id);


--
-- Name: model_profiles model_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_profiles
    ADD CONSTRAINT model_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: ppv_content ppv_content_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_content
    ADD CONSTRAINT ppv_content_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: ppv_purchases ppv_purchases_ppv_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_purchases
    ADD CONSTRAINT ppv_purchases_ppv_content_id_fkey FOREIGN KEY (ppv_content_id) REFERENCES public.ppv_content(id) ON DELETE CASCADE;


--
-- Name: ppv_purchases ppv_purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppv_purchases
    ADD CONSTRAINT ppv_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: premium_subscriptions premium_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_subscriptions
    ADD CONSTRAINT premium_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.premium_plans(id);


--
-- Name: premium_subscriptions premium_subscriptions_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_subscriptions
    ADD CONSTRAINT premium_subscriptions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: premium_subscriptions premium_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_subscriptions
    ADD CONSTRAINT premium_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: premium_verifications premium_verifications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_verifications
    ADD CONSTRAINT premium_verifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_analytics profile_analytics_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_analytics
    ADD CONSTRAINT profile_analytics_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_leads profile_leads_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_leads
    ADD CONSTRAINT profile_leads_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_reviews profile_reviews_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_reviews
    ADD CONSTRAINT profile_reviews_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_reviews profile_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_reviews
    ADD CONSTRAINT profile_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: profile_stats profile_stats_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_stats
    ADD CONSTRAINT profile_stats_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_stories profile_stories_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_stories
    ADD CONSTRAINT profile_stories_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_reported_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_profile_id_fkey FOREIGN KEY (reported_profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: reports reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: saved_content saved_content_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_content
    ADD CONSTRAINT saved_content_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.exclusive_content(id) ON DELETE CASCADE;


--
-- Name: saved_content saved_content_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_content
    ADD CONSTRAINT saved_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: story_reactions story_reactions_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_reactions
    ADD CONSTRAINT story_reactions_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.profile_stories(id) ON DELETE CASCADE;


--
-- Name: story_reactions story_reactions_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_reactions
    ADD CONSTRAINT story_reactions_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: story_views story_views_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.profile_stories(id) ON DELETE CASCADE;


--
-- Name: story_views story_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: subscription_payments subscription_payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_payments
    ADD CONSTRAINT subscription_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.content_subscriptions(id) ON DELETE CASCADE;


--
-- Name: subscription_tiers subscription_tiers_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_tiers
    ADD CONSTRAINT subscription_tiers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_messages ticket_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_mission_progress user_mission_progress_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mission_progress
    ADD CONSTRAINT user_mission_progress_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.daily_missions(id);


--
-- Name: user_mission_progress user_mission_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mission_progress
    ADD CONSTRAINT user_mission_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: verification_requests verification_requests_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.model_profiles(id) ON DELETE CASCADE;


--
-- Name: verification_requests verification_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);


--
-- Name: verification_requests verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: integration_settings Admins can insert integration settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert integration settings" ON public.integration_settings FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: admin_logs Admins can insert logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: affiliate_tiers Admins can manage affiliate tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage affiliate tiers" ON public.affiliate_tiers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ppv_content Admins can manage all PPV content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all PPV content" ON public.ppv_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliates Admins can manage all affiliates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all affiliates" ON public.affiliates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: appointments Admins can manage all appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all appointments" ON public.appointments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_comments Admins can manage all comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all comments" ON public.content_comments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_commissions Admins can manage all commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all commissions" ON public.affiliate_commissions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: exclusive_content Admins can manage all content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all content" ON public.exclusive_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: creator_earnings Admins can manage all earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all earnings" ON public.creator_earnings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: notifications Admins can manage all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all notifications" ON public.notifications USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subscription_payments Admins can manage all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payments" ON public.subscription_payments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_payouts Admins can manage all payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payouts" ON public.affiliate_payouts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: creator_payouts Admins can manage all payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payouts" ON public.creator_payouts TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_protection_settings Admins can manage all protection settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all protection settings" ON public.content_protection_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_referrals Admins can manage all referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all referrals" ON public.affiliate_referrals USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: auto_renewal_settings Admins can manage all renewal settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all renewal settings" ON public.auto_renewal_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_subscriptions Admins can manage all subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all subscriptions" ON public.content_subscriptions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subscription_tiers Admins can manage all tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all tiers" ON public.subscription_tiers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: boost_packages Admins can manage boost packages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage boost packages" ON public.boost_packages TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: monetization_bundles Admins can manage bundles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage bundles" ON public.monetization_bundles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: discount_coupons Admins can manage coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage coupons" ON public.discount_coupons USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: credit_packages Admins can manage credit packages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage credit packages" ON public.credit_packages TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: geographic_boosts Admins can manage geographic boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage geographic boosts" ON public.geographic_boosts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: loyalty_rewards Admins can manage loyalty rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage loyalty rewards" ON public.loyalty_rewards USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: daily_missions Admins can manage missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage missions" ON public.daily_missions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: partner_ads Admins can manage partner ads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage partner ads" ON public.partner_ads USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: premium_services Admins can manage premium services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage premium services" ON public.premium_services TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: premium_verifications Admins can manage premium verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage premium verifications" ON public.premium_verifications USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: integration_settings Admins can read integration settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read integration settings" ON public.integration_settings FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: model_profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON public.model_profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: integration_settings Admins can update integration settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update integration settings" ON public.integration_settings FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: reports Admins can update reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: ppv_purchases Admins can view all PPV purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all PPV purchases" ON public.ppv_purchases USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_views Admins can view all analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics" ON public.content_views USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profile_analytics Admins can view all analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all analytics" ON public.profile_analytics USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: active_boosts Admins can view all boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all boosts" ON public.active_boosts TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_credits Admins can view all credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all credits" ON public.user_credits TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: active_geographic_boosts Admins can view all geographic boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all geographic boosts" ON public.active_geographic_boosts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_login_attempts Admins can view all login attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all login attempts" ON public.admin_login_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_logs Admins can view all logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all logs" ON public.admin_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: active_premium_services Admins can view all premium services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all premium services" ON public.active_premium_services TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: model_profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.model_profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: reports Admins can view all reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: credit_transactions Admins can view all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all transactions" ON public.credit_transactions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_violation_logs Admins can view all violations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all violations" ON public.content_violation_logs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins podem atualizar tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem atualizar tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ticket_messages Admins podem criar mensagens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem criar mensagens" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins podem criar tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem criar tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: neighborhoods Admins podem gerenciar bairros; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar bairros" ON public.neighborhoods USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: content_blocks Admins podem gerenciar blocos de conteúdo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar blocos de conteúdo" ON public.content_blocks TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: categories Admins podem gerenciar categorias; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar categorias" ON public.categories TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cities_seo Admins podem gerenciar cidades SEO; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar cidades SEO" ON public.cities_seo TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: seo_settings Admins podem gerenciar configurações SEO; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar configurações SEO" ON public.seo_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ethnicities Admins podem gerenciar etnias; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar etnias" ON public.ethnicities TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: menu_items Admins podem gerenciar menu; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar menu" ON public.menu_items TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_subscription_plans Admins podem gerenciar planos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar planos" ON public.client_subscription_plans USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: dynamic_pages Admins podem gerenciar páginas dinâmicas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar páginas dinâmicas" ON public.dynamic_pages TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_subscriptions Admins podem gerenciar todas assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem gerenciar todas assinaturas" ON public.client_subscriptions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ticket_messages Admins podem ver todas as mensagens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem ver todas as mensagens" ON public.ticket_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_tickets Admins podem ver todos os tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins podem ver todos os tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_payouts Affiliates can request payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can request payouts" ON public.affiliate_payouts FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.affiliates
  WHERE ((affiliates.id = affiliate_payouts.affiliate_id) AND (affiliates.user_id = auth.uid())))));


--
-- Name: affiliate_commissions Affiliates can view own commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own commissions" ON public.affiliate_commissions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.affiliates
  WHERE ((affiliates.id = affiliate_commissions.affiliate_id) AND (affiliates.user_id = auth.uid())))));


--
-- Name: affiliate_payouts Affiliates can view own payouts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own payouts" ON public.affiliate_payouts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.affiliates
  WHERE ((affiliates.id = affiliate_payouts.affiliate_id) AND (affiliates.user_id = auth.uid())))));


--
-- Name: affiliate_referrals Affiliates can view own referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Affiliates can view own referrals" ON public.affiliate_referrals FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.affiliates
  WHERE ((affiliates.id = affiliate_referrals.affiliate_id) AND (affiliates.user_id = auth.uid())))));


--
-- Name: feed_interactions Anyone can insert interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert interactions" ON public.feed_interactions FOR INSERT WITH CHECK (true);


--
-- Name: story_reactions Anyone can insert reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert reactions" ON public.story_reactions FOR INSERT WITH CHECK (true);


--
-- Name: story_views Anyone can insert story views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert story views" ON public.story_views FOR INSERT WITH CHECK (true);


--
-- Name: ppv_content Anyone can view active PPV content info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active PPV content info" ON public.ppv_content FOR SELECT USING ((is_active = true));


--
-- Name: boost_packages Anyone can view active boost packages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active boost packages" ON public.boost_packages FOR SELECT USING ((is_active = true));


--
-- Name: monetization_bundles Anyone can view active bundles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active bundles" ON public.monetization_bundles FOR SELECT USING ((is_active = true));


--
-- Name: credit_packages Anyone can view active credit packages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active credit packages" ON public.credit_packages FOR SELECT USING ((is_active = true));


--
-- Name: geographic_boosts Anyone can view active geographic boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active geographic boosts" ON public.geographic_boosts FOR SELECT USING ((is_active = true));


--
-- Name: daily_missions Anyone can view active missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active missions" ON public.daily_missions FOR SELECT USING ((is_active = true));


--
-- Name: partner_ads Anyone can view active partner ads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active partner ads" ON public.partner_ads FOR SELECT USING (((is_active = true) AND ((now() >= start_date) AND (now() <= end_date))));


--
-- Name: premium_services Anyone can view active premium services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active premium services" ON public.premium_services FOR SELECT USING ((is_active = true));


--
-- Name: profile_stories Anyone can view active stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active stories" ON public.profile_stories FOR SELECT USING (((expires_at > now()) AND (EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_stories.profile_id) AND (model_profiles.is_active = true) AND (model_profiles.verified = true))))));


--
-- Name: subscription_tiers Anyone can view active tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active tiers" ON public.subscription_tiers FOR SELECT USING ((is_active = true));


--
-- Name: affiliate_tiers Anyone can view affiliate tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view affiliate tiers" ON public.affiliate_tiers FOR SELECT USING (true);


--
-- Name: model_profiles Anyone can view approved active profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved active profiles" ON public.model_profiles FOR SELECT USING (((is_active = true) AND (moderation_status = 'approved'::text)));


--
-- Name: exclusive_content Anyone can view preview content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view preview content" ON public.exclusive_content FOR SELECT USING ((is_preview = true));


--
-- Name: content_reactions Anyone can view reactions count; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reactions count" ON public.content_reactions FOR SELECT USING (true);


--
-- Name: profile_reviews Anyone can view verified reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view verified reviews" ON public.profile_reviews FOR SELECT USING ((is_verified = true));


--
-- Name: profile_reviews Authenticated users can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create reviews" ON public.profile_reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: model_profiles Modelos podem atualizar seus próprios anúncios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modelos podem atualizar seus próprios anúncios" ON public.model_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: model_profiles Modelos podem criar seus próprios anúncios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modelos podem criar seus próprios anúncios" ON public.model_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: model_profiles Modelos podem deletar seus próprios anúncios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modelos podem deletar seus próprios anúncios" ON public.model_profiles FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profile_stats Modelos podem ver suas próprias estatísticas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Modelos podem ver suas próprias estatísticas" ON public.profile_stats FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_stats.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: profile_stories Models can create stories for their own verified profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can create stories for their own verified profiles" ON public.profile_stories FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT model_profiles.user_id
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_stories.profile_id) AND (model_profiles.verified = true)))));


--
-- Name: verification_requests Models can create their own verification requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can create their own verification requests" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: model_profiles Models can delete their own profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can delete their own profiles" ON public.model_profiles FOR DELETE TO authenticated USING (((auth.uid() = user_id) AND public.has_role(auth.uid(), 'model'::public.app_role)));


--
-- Name: profile_stories Models can delete their own stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can delete their own stories" ON public.profile_stories FOR DELETE USING ((auth.uid() IN ( SELECT model_profiles.user_id
   FROM public.model_profiles
  WHERE (model_profiles.id = profile_stories.profile_id))));


--
-- Name: model_profiles Models can insert their own profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can insert their own profiles" ON public.model_profiles FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND public.has_role(auth.uid(), 'model'::public.app_role)));


--
-- Name: verification_requests Models can update their own pending requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can update their own pending requests" ON public.verification_requests FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND (status = 'pending'::text)));


--
-- Name: model_profiles Models can update their own profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can update their own profiles" ON public.model_profiles FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND public.has_role(auth.uid(), 'model'::public.app_role)));


--
-- Name: model_profiles Models can view approved active profiles or their own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can view approved active profiles or their own" ON public.model_profiles FOR SELECT USING ((((is_active = true) AND (moderation_status = 'approved'::text)) OR ((auth.uid() = user_id) AND public.has_role(auth.uid(), 'model'::public.app_role))));


--
-- Name: verification_requests Models can view their own verification requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Models can view their own verification requests" ON public.verification_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: creator_payouts Profile owners can create payout requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can create payout requests" ON public.creator_payouts FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = creator_payouts.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: profile_stories Profile owners can delete their stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can delete their stories" ON public.profile_stories FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_stories.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: profile_stories Profile owners can insert stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can insert stories" ON public.profile_stories FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_stories.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: appointments Profile owners can manage appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage appointments" ON public.appointments USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = appointments.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: content_protection_settings Profile owners can manage own protection settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage own protection settings" ON public.content_protection_settings USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = content_protection_settings.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: ppv_content Profile owners can manage their PPV content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage their PPV content" ON public.ppv_content USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = ppv_content.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: exclusive_content Profile owners can manage their content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage their content" ON public.exclusive_content USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = exclusive_content.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: profile_leads Profile owners can manage their leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage their leads" ON public.profile_leads USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_leads.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: subscription_tiers Profile owners can manage their tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can manage their tiers" ON public.subscription_tiers USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = subscription_tiers.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: profile_analytics Profile owners can view analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view analytics" ON public.profile_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = profile_analytics.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: conversations Profile owners can view conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view conversations" ON public.conversations USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = conversations.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: creator_earnings Profile owners can view own earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view own earnings" ON public.creator_earnings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = creator_earnings.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: creator_payouts Profile owners can view own payout requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view own payout requests" ON public.creator_payouts FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = creator_payouts.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: content_protection_settings Profile owners can view own protection settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view own protection settings" ON public.content_protection_settings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = content_protection_settings.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: ppv_purchases Profile owners can view their PPV sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their PPV sales" ON public.ppv_purchases FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.ppv_content pc
     JOIN public.model_profiles mp ON ((pc.profile_id = mp.id)))
  WHERE ((pc.id = ppv_purchases.ppv_content_id) AND (mp.user_id = auth.uid())))));


--
-- Name: content_views Profile owners can view their content analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their content analytics" ON public.content_views FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.exclusive_content ec
     JOIN public.model_profiles mp ON ((ec.profile_id = mp.id)))
  WHERE ((ec.id = content_views.content_id) AND (mp.user_id = auth.uid())))));


--
-- Name: feed_interactions Profile owners can view their interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their interactions" ON public.feed_interactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = feed_interactions.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: subscription_payments Profile owners can view their payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their payments" ON public.subscription_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.content_subscriptions cs
     JOIN public.model_profiles mp ON ((cs.profile_id = mp.id)))
  WHERE ((cs.id = subscription_payments.subscription_id) AND (mp.user_id = auth.uid())))));


--
-- Name: story_views Profile owners can view their stories' views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their stories' views" ON public.story_views FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.profile_stories ps
     JOIN public.model_profiles mp ON ((ps.profile_id = mp.id)))
  WHERE ((ps.id = story_views.story_id) AND (mp.user_id = auth.uid())))));


--
-- Name: story_reactions Profile owners can view their story reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their story reactions" ON public.story_reactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.profile_stories ps
     JOIN public.model_profiles mp ON ((ps.profile_id = mp.id)))
  WHERE ((ps.id = story_reactions.story_id) AND (mp.user_id = auth.uid())))));


--
-- Name: content_subscriptions Profile owners can view their subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view their subscribers" ON public.content_subscriptions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.model_profiles
  WHERE ((model_profiles.id = content_subscriptions.profile_id) AND (model_profiles.user_id = auth.uid())))));


--
-- Name: content_violation_logs Profile owners can view violations on their content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profile owners can view violations on their content" ON public.content_violation_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.exclusive_content ec
     JOIN public.model_profiles mp ON ((ec.profile_id = mp.id)))
  WHERE ((ec.id = content_violation_logs.content_id) AND (mp.user_id = auth.uid())))));


--
-- Name: profile_stats Qualquer pessoa pode ver estatísticas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer pessoa pode ver estatísticas" ON public.profile_stats FOR SELECT USING (true);


--
-- Name: content_reactions Subscribers can add reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Subscribers can add reactions" ON public.content_reactions FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.exclusive_content ec
     JOIN public.content_subscriptions cs ON ((cs.profile_id = ec.profile_id)))
  WHERE ((ec.id = content_reactions.content_id) AND (cs.subscriber_id = auth.uid()) AND (cs.status = 'active'::text) AND (cs.end_date > now()))))));


--
-- Name: content_comments Subscribers can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Subscribers can create comments" ON public.content_comments FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.exclusive_content ec
     JOIN public.content_subscriptions cs ON ((cs.profile_id = ec.profile_id)))
  WHERE ((ec.id = content_comments.content_id) AND (cs.subscriber_id = auth.uid()) AND (cs.status = 'active'::text) AND (cs.end_date > now()))))));


--
-- Name: content_comments Subscribers can view comments on content they have access to; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Subscribers can view comments on content they have access to" ON public.content_comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.exclusive_content ec
  WHERE ((ec.id = content_comments.content_id) AND ((ec.is_preview = true) OR (EXISTS ( SELECT 1
           FROM public.content_subscriptions cs
          WHERE ((cs.subscriber_id = auth.uid()) AND (cs.profile_id = ec.profile_id) AND (cs.status = 'active'::text) AND (cs.end_date > now())))))))));


--
-- Name: exclusive_content Subscribers can view paid content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Subscribers can view paid content" ON public.exclusive_content FOR SELECT USING (((is_preview = true) OR (EXISTS ( SELECT 1
   FROM (public.content_subscriptions cs
     JOIN public.subscription_tiers st ON ((cs.tier_id = st.id)))
  WHERE ((cs.subscriber_id = auth.uid()) AND (cs.profile_id = exclusive_content.profile_id) AND (cs.status = 'active'::text) AND (cs.end_date > now()) AND ((exclusive_content.required_tier_id IS NULL) OR (st.sort_order >= ( SELECT subscription_tiers.sort_order
           FROM public.subscription_tiers
          WHERE (subscription_tiers.id = exclusive_content.required_tier_id)))))))));


--
-- Name: affiliate_commissions System can insert commissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert commissions" ON public.affiliate_commissions FOR INSERT WITH CHECK (true);


--
-- Name: affiliate_referrals System can insert referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert referrals" ON public.affiliate_referrals FOR INSERT WITH CHECK (true);


--
-- Name: content_violation_logs System can insert violation logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert violation logs" ON public.content_violation_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: neighborhoods Todos podem ver bairros ativos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver bairros ativos" ON public.neighborhoods FOR SELECT USING ((is_active = true));


--
-- Name: content_blocks Todos podem ver blocos de conteúdo ativos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver blocos de conteúdo ativos" ON public.content_blocks FOR SELECT USING ((is_active = true));


--
-- Name: categories Todos podem ver categorias ativas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver categorias ativas" ON public.categories FOR SELECT USING ((is_active = true));


--
-- Name: cities_seo Todos podem ver cidades ativas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver cidades ativas" ON public.cities_seo FOR SELECT USING ((is_active = true));


--
-- Name: seo_settings Todos podem ver configurações SEO; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver configurações SEO" ON public.seo_settings FOR SELECT USING (true);


--
-- Name: ethnicities Todos podem ver etnias ativas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver etnias ativas" ON public.ethnicities FOR SELECT USING ((is_active = true));


--
-- Name: menu_items Todos podem ver menu ativo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver menu ativo" ON public.menu_items FOR SELECT USING ((is_active = true));


--
-- Name: client_subscription_plans Todos podem ver planos ativos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver planos ativos" ON public.client_subscription_plans FOR SELECT USING ((is_active = true));


--
-- Name: premium_plans Todos podem ver planos ativos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver planos ativos" ON public.premium_plans FOR SELECT USING ((is_active = true));


--
-- Name: dynamic_pages Todos podem ver páginas publicadas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver páginas publicadas" ON public.dynamic_pages FOR SELECT USING ((is_published = true));


--
-- Name: ppv_purchases Users can create own PPV purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own PPV purchases" ON public.ppv_purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: affiliates Users can create own affiliate account; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own affiliate account" ON public.affiliates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: active_boosts Users can create own boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own boosts" ON public.active_boosts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: active_geographic_boosts Users can create own geographic boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own geographic boosts" ON public.active_geographic_boosts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: premium_verifications Users can create own premium verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own premium verifications" ON public.premium_verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: auto_renewal_settings Users can create own renewal settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own renewal settings" ON public.auto_renewal_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: content_subscriptions Users can create own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own subscriptions" ON public.content_subscriptions FOR INSERT WITH CHECK ((subscriber_id = auth.uid()));


--
-- Name: reports Users can create reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK ((reporter_id = auth.uid()));


--
-- Name: content_views Users can create view records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create view records" ON public.content_views FOR INSERT WITH CHECK ((viewer_id = auth.uid()));


--
-- Name: content_comments Users can delete own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own comments" ON public.content_comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: content_reactions Users can delete own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own reactions" ON public.content_reactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: auto_renewal_settings Users can delete own renewal settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own renewal settings" ON public.auto_renewal_settings FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_content Users can delete own saved content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own saved content" ON public.saved_content FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can insert their own role during signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own role during signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_content Users can save content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save content" ON public.saved_content FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: client_messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.client_messages FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.visitor_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.model_profiles
          WHERE ((model_profiles.id = conversations.profile_id) AND (model_profiles.user_id = auth.uid())))))))));


--
-- Name: affiliates Users can update own affiliate data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own affiliate data" ON public.affiliates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: content_comments Users can update own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own comments" ON public.content_comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: client_messages Users can update own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own messages" ON public.client_messages FOR UPDATE USING ((auth.uid() = receiver_id));


--
-- Name: user_mission_progress Users can update own mission progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own mission progress" ON public.user_mission_progress TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: auto_renewal_settings Users can update own renewal settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own renewal settings" ON public.auto_renewal_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profile_reviews Users can update own reviews within 24h; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reviews within 24h" ON public.profile_reviews FOR UPDATE USING (((auth.uid() = user_id) AND (created_at > (now() - '24:00:00'::interval))));


--
-- Name: content_subscriptions Users can update own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own subscriptions" ON public.content_subscriptions FOR UPDATE USING ((subscriber_id = auth.uid()));


--
-- Name: discount_coupons Users can view active coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active coupons" ON public.discount_coupons FOR SELECT USING (((is_active = true) AND ((now() >= valid_from) AND (now() <= valid_until))));


--
-- Name: profile_stories Users can view all active stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all active stories" ON public.profile_stories FOR SELECT USING (true);


--
-- Name: ppv_purchases Users can view own PPV purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own PPV purchases" ON public.ppv_purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: affiliates Users can view own affiliate data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own affiliate data" ON public.affiliates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: active_boosts Users can view own boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own boosts" ON public.active_boosts FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_credits Users can view own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: active_geographic_boosts Users can view own geographic boosts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own geographic boosts" ON public.active_geographic_boosts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_rewards Users can view own loyalty rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own loyalty rewards" ON public.loyalty_rewards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: client_messages Users can view own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own messages" ON public.client_messages FOR SELECT USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- Name: user_mission_progress Users can view own mission progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own mission progress" ON public.user_mission_progress FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: subscription_payments Users can view own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments" ON public.subscription_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.content_subscriptions
  WHERE ((content_subscriptions.id = subscription_payments.subscription_id) AND (content_subscriptions.subscriber_id = auth.uid())))));


--
-- Name: active_premium_services Users can view own premium services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own premium services" ON public.active_premium_services FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: premium_verifications Users can view own premium verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own premium verifications" ON public.premium_verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: auto_renewal_settings Users can view own renewal settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own renewal settings" ON public.auto_renewal_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_content Users can view own saved content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own saved content" ON public.saved_content FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: content_subscriptions Users can view own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscriptions" ON public.content_subscriptions FOR SELECT USING ((subscriber_id = auth.uid()));


--
-- Name: credit_transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.visitor_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.model_profiles
          WHERE ((model_profiles.id = conversations.profile_id) AND (model_profiles.user_id = auth.uid())))))))));


--
-- Name: profile_reviews Users can view their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reviews" ON public.profile_reviews FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: story_views Users can view their own story views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own story views" ON public.story_views FOR SELECT USING ((auth.uid() = viewer_id));


--
-- Name: client_subscriptions Usuários podem atualizar próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprias assinaturas" ON public.client_subscriptions FOR UPDATE USING ((auth.uid() = subscriber_id));


--
-- Name: profiles Usuários podem atualizar seu próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: premium_subscriptions Usuários podem atualizar suas próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar suas próprias assinaturas" ON public.premium_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ticket_messages Usuários podem criar mensagens nos seus tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar mensagens nos seus tickets" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_messages.ticket_id) AND (support_tickets.user_id = auth.uid())))));


--
-- Name: client_subscriptions Usuários podem criar próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprias assinaturas" ON public.client_subscriptions FOR INSERT WITH CHECK ((auth.uid() = subscriber_id));


--
-- Name: support_tickets Usuários podem criar seus próprios tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar seus próprios tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: premium_subscriptions Usuários podem criar suas próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar suas próprias assinaturas" ON public.premium_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ticket_messages Usuários podem ver mensagens dos seus tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver mensagens dos seus tickets" ON public.ticket_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.support_tickets
  WHERE ((support_tickets.id = ticket_messages.ticket_id) AND (support_tickets.user_id = auth.uid())))));


--
-- Name: client_subscriptions Usuários podem ver próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias assinaturas" ON public.client_subscriptions FOR SELECT USING ((auth.uid() = subscriber_id));


--
-- Name: profiles Usuários podem ver seu próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: support_tickets Usuários podem ver seus próprios tickets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver seus próprios tickets" ON public.support_tickets FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: premium_subscriptions Usuários podem ver suas próprias assinaturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver suas próprias assinaturas" ON public.premium_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: story_reactions Viewers can view their own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Viewers can view their own reactions" ON public.story_reactions FOR SELECT USING ((auth.uid() = viewer_id));


--
-- Name: conversations Visitors can view their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Visitors can view their conversations" ON public.conversations FOR SELECT USING ((visitor_id = auth.uid()));


--
-- Name: active_boosts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: active_geographic_boosts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_geographic_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: active_premium_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_premium_services ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_login_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_commissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_payouts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliate_tiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: affiliates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: auto_renewal_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auto_renewal_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: boost_packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boost_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: cities_seo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities_seo ENABLE ROW LEVEL SECURITY;

--
-- Name: client_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: client_subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: client_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: content_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: content_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: content_protection_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_protection_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: content_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: content_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: content_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

--
-- Name: content_violation_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_violation_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: creator_earnings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;

--
-- Name: creator_payouts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

--
-- Name: discount_coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: dynamic_pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: ethnicities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ethnicities ENABLE ROW LEVEL SECURITY;

--
-- Name: exclusive_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exclusive_content ENABLE ROW LEVEL SECURITY;

--
-- Name: feed_interactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feed_interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: geographic_boosts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.geographic_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: integration_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: model_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: monetization_bundles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.monetization_bundles ENABLE ROW LEVEL SECURITY;

--
-- Name: neighborhoods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_ads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_ads ENABLE ROW LEVEL SECURITY;

--
-- Name: ppv_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ppv_content ENABLE ROW LEVEL SECURITY;

--
-- Name: ppv_purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ppv_purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_services ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_leads ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_stories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_stories ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;

--
-- Name: seo_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: story_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: story_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_tiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_mission_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


