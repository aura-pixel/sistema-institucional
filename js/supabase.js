// js/supabase.js

// ⚠️ IMPORTANTE:
// Reemplaza "TU_SUPABASE_ANON_KEY" con tu anon public key
// La encuentras en:
// Supabase → Settings → API → Project API Keys → anon public

const SUPABASE_URL = "https://wtoabzgmzusqejunbyrj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__La4i0KjFtD_Ez7YpIqJKQ_T1i3mOx6";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);