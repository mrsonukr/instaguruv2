-- Find existing duplicate txnId values
SELECT 
    txnId, 
    COUNT(*) as count,
    GROUP_CONCAT(order_id) as duplicate_order_ids
FROM orders 
WHERE txnId IS NOT NULL AND txnId != ''
GROUP BY txnId 
HAVING COUNT(*) > 1;

-- Show all orders with txnId for review
SELECT order_id, txnId, created_at 
FROM orders 
WHERE txnId IS NOT NULL AND txnId != ''
ORDER BY txnId, created_at;
