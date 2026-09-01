-- =========================================================================
-- SkillSwap Master Database Schema & Functions
-- Run this in your Supabase SQL Editor to set up the complete database
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    background_image_url TEXT,
    bio TEXT,
    time_available TEXT,
    time_balance NUMERIC(10,2) DEFAULT 12.00,
    reserved_hours NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a profile for new users upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, time_balance, reserved_hours)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        12.00,
        0.00
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = COALESCE(EXCLUDED.name, profiles.name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();

    -- Also record welcome grant in time_ledger
    INSERT INTO public.time_ledger (user_id, amount, entry_type, balance_after, reserved_after, description)
    VALUES (
        NEW.id,
        12.00,
        'initial_grant',
        12.00,
        0.00,
        'Welcome grant: 12 starting Time Bank hours'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure if ledger or secondary table fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Skills Table (User Profile Skills)
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offered', 'wanted')),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Listings Table (Community Marketplace)
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offered', 'wanted', 'offer', 'request')),
    category TEXT NOT NULL,
    sub_category TEXT,
    skill_names TEXT[] DEFAULT '{}',
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exchanges Table
CREATE TABLE IF NOT EXISTS exchanges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    hours NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (hours > 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'rejected', 'cancelled', 'completed')),
    requester_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    provider_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Sessions Table (Scheduled 1-on-1 Sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    meeting_link TEXT CHECK (meeting_link IS NULL OR meeting_link ~* '^https?://'),
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_exchange_session UNIQUE (exchange_id)
);

-- 7. Time Ledger Table (Immutable Transaction Log)
CREATE TABLE IF NOT EXISTS time_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exchange_id UUID REFERENCES exchanges(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('initial_grant', 'exchange_debit', 'exchange_credit')),
    balance_after NUMERIC(10,2) NOT NULL,
    reserved_after NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Messages Table (Real-Time Direct Chat)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- Foreign Key Shortcuts for Supabase Join Queries
-- =========================================================================
DO $$
BEGIN
    ALTER TABLE listings ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

-- =========================================================================
-- Row Level Security (RLS) Policies
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
END $$;
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view skills" ON skills;
    DROP POLICY IF EXISTS "Users can insert own skills" ON skills;
    DROP POLICY IF EXISTS "Users can update own skills" ON skills;
    DROP POLICY IF EXISTS "Users can delete own skills" ON skills;
END $$;
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Users can insert own skills" ON skills FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own skills" ON skills FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Users can delete own skills" ON skills FOR DELETE USING (profile_id = auth.uid());

-- Listings Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view listings" ON listings;
    DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
    DROP POLICY IF EXISTS "Users can update own listings" ON listings;
    DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
END $$;
CREATE POLICY "Public can view listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (user_id = auth.uid());

-- Exchanges Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Participants can view exchanges" ON exchanges;
    DROP POLICY IF EXISTS "Users can create exchange requests" ON exchanges;
    DROP POLICY IF EXISTS "Participants can update exchanges" ON exchanges;
END $$;
CREATE POLICY "Participants can view exchanges" ON exchanges FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = provider_id);
CREATE POLICY "Users can create exchange requests" ON exchanges FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update exchanges" ON exchanges FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = provider_id);

-- Sessions Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Participants can view sessions" ON sessions;
    DROP POLICY IF EXISTS "Participants can create sessions" ON sessions;
    DROP POLICY IF EXISTS "Participants can update sessions" ON sessions;
END $$;
CREATE POLICY "Participants can view sessions" ON sessions FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = learner_id);
CREATE POLICY "Participants can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);
CREATE POLICY "Participants can update sessions" ON sessions FOR UPDATE USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Time Ledger Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own ledger" ON time_ledger;
END $$;
CREATE POLICY "Users can view own ledger" ON time_ledger FOR SELECT USING (auth.uid() = user_id);

-- Messages Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Participants can view messages" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Receivers can mark messages read" ON messages;
END $$;
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can mark messages read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- =========================================================================
-- Storage Bucket Setup (Profile Images & Backgrounds)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view profile assets" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload profile assets" ON storage.objects;
END $$;
CREATE POLICY "Public can view profile assets" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Authenticated users can upload profile assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- =========================================================================
-- RPC Functions for Atomic Time Banking
-- =========================================================================

-- 1. Create Exchange Request
CREATE OR REPLACE FUNCTION create_exchange_request(
    p_listing_id UUID,
    p_skill_name TEXT,
    p_hours NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_provider_id UUID;
    v_exchange_id UUID;
    v_req_balance NUMERIC;
    v_req_reserved NUMERIC;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT user_id INTO v_provider_id FROM listings WHERE id = p_listing_id AND status = 'open';
    IF v_provider_id IS NULL THEN
        RAISE EXCEPTION 'Target listing is not open.';
    END IF;

    IF v_provider_id = auth.uid() THEN
        RAISE EXCEPTION 'Self-exchange is prohibited.';
    END IF;

    SELECT time_balance, reserved_hours INTO v_req_balance, v_req_reserved FROM profiles WHERE id = auth.uid();
    IF (COALESCE(v_req_balance, 0) - COALESCE(v_req_reserved, 0)) < p_hours THEN
        RAISE EXCEPTION 'Insufficient available Time Bank hours.';
    END IF;

    INSERT INTO exchanges (listing_id, requester_id, provider_id, skill_name, hours, status)
    VALUES (p_listing_id, auth.uid(), v_provider_id, p_skill_name, p_hours, 'requested')
    RETURNING id INTO v_exchange_id;

    RETURN json_build_object('exchange_id', v_exchange_id, 'status', 'requested');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Accept Exchange & Reserve Hours
CREATE OR REPLACE FUNCTION accept_exchange_and_reserve(p_exchange_id UUID)
RETURNS JSON AS $$
DECLARE
    v_exchange exchanges%ROWTYPE;
BEGIN
    SELECT * INTO v_exchange FROM exchanges WHERE id = p_exchange_id;
    IF v_exchange.id IS NULL THEN
        RAISE EXCEPTION 'Exchange record not found.';
    END IF;

    IF v_exchange.provider_id != auth.uid() THEN
        RAISE EXCEPTION 'Only the listing provider can accept.';
    END IF;

    UPDATE profiles
    SET reserved_hours = COALESCE(reserved_hours, 0) + v_exchange.hours
    WHERE id = v_exchange.requester_id;

    UPDATE exchanges SET status = 'accepted', updated_at = NOW() WHERE id = p_exchange_id;

    RETURN json_build_object('success', true, 'status', 'accepted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reject Exchange
CREATE OR REPLACE FUNCTION reject_exchange_request(p_exchange_id UUID)
RETURNS JSON AS $$
BEGIN
    UPDATE exchanges SET status = 'rejected', updated_at = NOW()
    WHERE id = p_exchange_id AND provider_id = auth.uid();

    RETURN json_build_object('success', true, 'status', 'rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cancel Exchange (Releases Reservation if Accepted)
CREATE OR REPLACE FUNCTION cancel_exchange(p_exchange_id UUID)
RETURNS JSON AS $$
DECLARE
    v_exchange exchanges%ROWTYPE;
BEGIN
    SELECT * INTO v_exchange FROM exchanges WHERE id = p_exchange_id;
    IF v_exchange.id IS NULL THEN
        RAISE EXCEPTION 'Exchange record not found.';
    END IF;

    IF v_exchange.requester_id != auth.uid() AND v_exchange.provider_id != auth.uid() THEN
        RAISE EXCEPTION 'You are not a participant.';
    END IF;

    IF v_exchange.status = 'accepted' THEN
        UPDATE profiles
        SET reserved_hours = GREATEST(0, COALESCE(reserved_hours, 0) - v_exchange.hours)
        WHERE id = v_exchange.requester_id;
    END IF;

    UPDATE exchanges SET status = 'cancelled', updated_at = NOW() WHERE id = p_exchange_id;

    RETURN json_build_object('success', true, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Confirm and Settle Exchange (Atomic Transfer)
CREATE OR REPLACE FUNCTION confirm_and_settle_exchange(p_exchange_id UUID)
RETURNS JSON AS $$
DECLARE
    v_exchange exchanges%ROWTYPE;
    v_is_requester BOOLEAN;
    v_both_confirmed BOOLEAN := FALSE;
    v_req_new_bal NUMERIC;
    v_prov_new_bal NUMERIC;
BEGIN
    SELECT * INTO v_exchange FROM exchanges WHERE id = p_exchange_id;
    IF v_exchange.id IS NULL THEN
        RAISE EXCEPTION 'Exchange record not found.';
    END IF;

    IF v_exchange.status != 'accepted' THEN
        RAISE EXCEPTION 'Exchange is not in accepted status.';
    END IF;

    v_is_requester := (v_exchange.requester_id = auth.uid());

    IF v_is_requester THEN
        UPDATE exchanges SET requester_confirmed = TRUE WHERE id = p_exchange_id;
        v_exchange.requester_confirmed := TRUE;
    ELSE
        UPDATE exchanges SET provider_confirmed = TRUE WHERE id = p_exchange_id;
        v_exchange.provider_confirmed := TRUE;
    END IF;

    IF v_exchange.requester_confirmed AND v_exchange.provider_confirmed THEN
        v_both_confirmed := TRUE;

        -- Debit Requester
        UPDATE profiles
        SET time_balance = time_balance - v_exchange.hours,
            reserved_hours = GREATEST(0, reserved_hours - v_exchange.hours)
        WHERE id = v_exchange.requester_id
        RETURNING time_balance INTO v_req_new_bal;

        -- Credit Provider (Capped at 100 hrs)
        UPDATE profiles
        SET time_balance = LEAST(100.00, time_balance + v_exchange.hours)
        WHERE id = v_exchange.provider_id
        RETURNING time_balance INTO v_prov_new_bal;

        -- Log in Time Ledger
        INSERT INTO time_ledger (exchange_id, user_id, amount, entry_type, balance_after, description)
        VALUES 
            (p_exchange_id, v_exchange.requester_id, -v_exchange.hours, 'exchange_debit', v_req_new_bal, 'Completed exchange: ' || v_exchange.skill_name),
            (p_exchange_id, v_exchange.provider_id, v_exchange.hours, 'exchange_credit', v_prov_new_bal, 'Earned from teaching: ' || v_exchange.skill_name);

        -- Mark Completed
        UPDATE exchanges SET status = 'completed', completed_at = NOW() WHERE id = p_exchange_id;
        UPDATE sessions SET status = 'completed', updated_at = NOW() WHERE exchange_id = p_exchange_id;
    END IF;

    RETURN json_build_object('settled', v_both_confirmed, 'status', CASE WHEN v_both_confirmed THEN 'completed' ELSE 'accepted' END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
