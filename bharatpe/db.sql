-- ===================================
-- 1) Create transactions table
-- ===================================
CREATE TABLE IF NOT EXISTS transactions (
  orderId INTEGER PRIMARY KEY AUTOINCREMENT,
  utr TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL,
  payer_name TEXT,
  payer TEXT,
  timestamp_ms INTEGER NOT NULL,
  orderPlaced INTEGER NOT NULL DEFAULT 0,
  created_at_s INTEGER DEFAULT (strftime('%s','now'))
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_utr ON transactions(utr);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount_paise);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp_ms);


-- ===================================
-- 2) Create orders table
-- ===================================
CREATE TABLE IF NOT EXISTS orders (
  order_id INTEGER,
  quantity TEXT NOT NULL,
  link TEXT NOT NULL,
  amount REAL NOT NULL,
  service TEXT NOT NULL,
  apiid INTEGER DEFAULT NULL,
  created_at INTEGER NOT NULL,

  PRIMARY KEY(order_id),
  FOREIGN KEY(order_id) REFERENCES transactions(orderId)
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_link ON orders(link);
CREATE INDEX IF NOT EXISTS idx_orders_service ON orders(service);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);


-- ===================================
-- 3) Insert dummy row to create sqlite_sequence
-- ===================================
INSERT INTO transactions (utr, amount_paise, timestamp_ms)
VALUES ('temp-utr', 1, strftime('%s','now'));

-- ===================================
-- 4) Delete dummy row
-- ===================================
DELETE FROM transactions WHERE utr = 'temp-utr';

-- ===================================
-- 5) Set AUTO_INCREMENT start value => 1000
-- ===================================
UPDATE sqlite_sequence SET seq = 999 WHERE name = 'transactions';
