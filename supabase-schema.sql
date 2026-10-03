-- =============================================
--  EXPENSES TRACKER — Supabase Schema
--  Run this in your Supabase SQL Editor
-- =============================================

-- 1) Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '📦',
  color       TEXT NOT NULL DEFAULT '#176b55',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2) Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount          NUMERIC(10,2) NOT NULL,
  description     TEXT,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method  TEXT NOT NULL DEFAULT 'cash'
                  CHECK (payment_method IN ('cash','upi','card')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3) Index for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

-- 4) Row Level Security (permissive for development)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on categories" ON categories;
CREATE POLICY "Allow all on categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on expenses" ON expenses;
CREATE POLICY "Allow all on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

-- 5) Enable Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 6) Seed default categories
INSERT INTO categories (name, icon, color)
SELECT * FROM (VALUES
  ('Tiffin',         '🍛', '#176b55'),
  ('Travel',         '🚍', '#c5d76d'),
  ('Food',           '🥗', '#2d8a6e'),
  ('Groceries',      '🛒', '#7ba68c'),
  ('Bills',          '💡', '#e9a37d'),
  ('College',        '🎓', '#9bb8aa'),
  ('Entertainment',  '🎬', '#bd8bb4')
) AS v(name, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM categories);

