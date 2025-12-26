-- Option 1: Keep the first occurrence and set others to NULL
UPDATE orders 
SET txnId = NULL 
WHERE rowid NOT IN (
    SELECT MIN(rowid) 
    FROM orders 
    WHERE txnId IS NOT NULL AND txnId != ''
    GROUP BY txnId
) AND txnId IS NOT NULL AND txnId != '';

-- Option 2: Keep the most recent occurrence and set older ones to NULL
-- Uncomment this if you prefer keeping the latest order
/*
UPDATE orders 
SET txnId = NULL 
WHERE rowid NOT IN (
    SELECT MAX(rowid) 
    FROM orders 
    WHERE txnId IS NOT NULL AND txnId != ''
    GROUP BY txnId
) AND txnId IS NOT NULL AND txnId != '';
*/

-- After fixing duplicates, you can create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_txnId ON orders(txnId);
