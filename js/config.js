// ─── Supabase Configuration ────────────────────────────────

const APP_CONFIG = window.APP_CONFIG || {};

const SUPABASE_URL = APP_CONFIG.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = APP_CONFIG.SUPABASE_ANON_KEY || '';

// Monthly budget (in ₹) — change this in .env or Vercel settings
const MONTHLY_BUDGET = Number(APP_CONFIG.MONTHLY_BUDGET || 15000);

