/* ═══════════════════════════════════════════════════════════
   EXPENSES TRACKER — Shared Application Logic
   ═══════════════════════════════════════════════════════════ */

/* ── Supabase Client ─────────────────────────────────────── */
let db = null;
if (typeof window !== 'undefined' && window.supabase && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ── Constants ───────────────────────────────────────────── */
const BUDGET = (typeof MONTHLY_BUDGET !== 'undefined') ? MONTHLY_BUDGET : 15000;

/* ── Formatting Helpers ──────────────────────────────────── */
function formatCurrency(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).toUpperCase();
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// month can be 0-11 or 1-12. If month > 12, assume month is 1-indexed.
function monthStartStr(year, month) {
  const m = (month > 0 && month <= 12) ? month : month + 1;
  return `${year}-${String(m).padStart(2, '0')}-01`;
}

function monthEndStr(year, month) {
  const m = (month > 0 && month <= 12) ? month : month + 1;
  const lastDay = new Date(year, m, 0).getDate();
  return `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function daysInMonth(year, month) {
  const m = (month > 0 && month <= 12) ? month : month + 1;
  return new Date(year, m, 0).getDate();
}

function monthYearLabel(year, month) {
  const m = (month > 0 && month <= 12) ? month - 1 : month;
  return new Date(year, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/* ── CRUD: Expenses ──────────────────────────────────────── */
async function fetchExpenses(from, to) {
  if (!db) return [];
  try {
    let query = db.from('expenses').select('*, categories(*)');
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchExpenses warning/error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('fetchExpenses error:', err);
    return [];
  }
}

async function insertExpense({ amount, description, category_id, date, payment_method }) {
  if (!db) throw new Error('Supabase client not initialized');
  const payload = {
    amount: parseFloat(amount),
    description: description || '',
    category_id: category_id || null,
    date: date || todayStr(),
    payment_method: payment_method || 'cash'
  };
  const { data, error } = await db
    .from('expenses')
    .insert([payload])
    .select('*, categories(*)');
  if (error) throw error;
  return data ? data[0] : null;
}

async function removeExpense(id) {
  if (!db) throw new Error('Supabase client not initialized');
  const { error } = await db.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

/* ── CRUD: Categories ────────────────────────────────────── */
async function fetchCategories() {
  if (!db) return [];
  try {
    const { data, error } = await db
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('fetchCategories warning/error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('fetchCategories error:', err);
    return [];
  }
}

async function insertCategory({ name, icon, color }) {
  if (!db) throw new Error('Supabase client not initialized');
  const { data, error } = await db
    .from('categories')
    .insert([{ name, icon: icon || '📦', color: color || '#176b55' }])
    .select();
  if (error) throw error;
  return data ? data[0] : null;
}

async function removeCategory(id) {
  if (!db) throw new Error('Supabase client not initialized');
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) throw error;
}

/* ── Realtime Subscriptions ──────────────────────────────── */
function subscribeExpenses(callback) {
  if (!db) return null;
  return db.channel('public:expenses')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, callback)
    .subscribe();
}

function subscribeCategories(callback) {
  if (!db) return null;
  return db.channel('public:categories')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, callback)
    .subscribe();
}

/* ── Toast Notification ──────────────────────────────────── */
function showToast(message, type = 'success') {
  const old = document.getElementById('app-toast');
  if (old) old.remove();

  const t = document.createElement('div');
  t.id = 'app-toast';
  const bg = type === 'error' ? 'bg-[#c92a2a]' : 'bg-[var(--color-primary)]';
  t.className = `fixed top-6 left-1/2 -translate-x-1/2 ${bg} text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg z-[100] transition-opacity duration-300 pointer-events-none`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

/* ── Loading Spinner ─────────────────────────────────────── */
function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-center py-10">
      <div class="w-7 h-7 border-2 border-[var(--color-line)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
    </div>`;
}

/* ── PWA & Service Worker ────────────────────────────────── */
let deferredInstallPrompt = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('ServiceWorker registered:', reg.scope))
      .catch((err) => console.log('ServiceWorker registration failed:', err));
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    renderInstallBanner();
  });
}

function renderInstallBanner() {
  if (document.getElementById('pwa-install-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[390px] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-xl rounded-2xl p-3.5 flex items-center justify-between z-50 animate-bounce-once';
  banner.innerHTML = `
    <div class="flex items-center gap-3">
      <img src="/icons/icon-192.png" class="w-10 h-10 rounded-xl" alt="Icon" />
      <div>
        <p class="text-xs font-bold">Install My Expenses</p>
        <p class="text-[10px] text-[var(--color-muted)]">Use as full screen mobile app</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button id="pwa-install-btn" class="bg-[var(--color-primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-xl">Install</button>
      <button onclick="this.closest('#pwa-install-banner').remove()" class="text-xs text-[var(--color-muted)] p-1">✕</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('pwa-install-btn').addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        banner.remove();
      }
      deferredInstallPrompt = null;
    }
  });
}


