import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snndqegmitwhziokpbxr.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_VRkHRPAIqE_P_dXk53vaEQ_ZK6uaxw_';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );

