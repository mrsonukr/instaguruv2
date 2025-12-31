import { json } from '../utils';

// Handler for POST /webhook
export async function handleWebhook(request, env) {
	try {
		const body = await request.json();
		
		// Extract and filter required fields
		const {
			customer_mobile, // Note: typo in incoming data, but we don't store it
			utr,
			remark,
			txn_id,
			create_at, // Incoming field, but we now ignore it for created_at and use current time
			order_id,
			status,
			amount
		} = body;

		// Validate required fields
		if (!utr || !txn_id || !order_id || !status || !amount) {
			return json({
				success: false,
				error: 'Missing required fields: utr, txn_id, order_id, status, amount'
			}, 400);
		}

		// Convert amount to integer (paise)
		const amountPaise = Math.round(parseFloat(amount) * 100);
		console.log('[WEBHOOK] Incoming order_id for TXN check:', order_id);

		// Insert into webhook table (created_at handled by DB default)
		const result = await env.bharatpe
			.prepare(
				`INSERT INTO webhook 
				        (order_id, utr, txn_id, status, amount, remark)
				         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
			)
			.bind(order_id, utr, txn_id, status, amountPaise, remark ?? null)
			.run();

		// Get the inserted record ID
		const insertedId = result.meta.last_row_id;

		// If order_id starts with 'TXN', forward a minimal payload to external webhook
		// using the original webhook values exactly as received
		const normalizedOrderId = typeof order_id === 'string' ? order_id.trim().toUpperCase() : '';
		if (normalizedOrderId.startsWith('TXN')) {
			const forwardPayload = {
				order_id,
				utr,
				txn_id,
				status,
				amount: amountPaise, // paise
				remark: remark ?? null,
			};
			console.log('[WEBHOOK] Forwarding TXN payload to smmviews', forwardPayload);

			try {
				const resp = await fetch('https://smmviews.mrotpguru.workers.dev/payments/webhook', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(forwardPayload),
				});
				if (!resp.ok) {
					let text = '';
					try {
						text = await resp.text();
					} catch (_) {}
					console.log('[WEBHOOK] Forward to smmviews non-200', resp.status, text);
				} else {
					console.log('[WEBHOOK] Forward to smmviews success', resp.status);
				}
			} catch (err) {
				console.log('[WEBHOOK] Forward to smmviews failed', err && err.message ? err.message : err);
			}
		}

		return json({
			success: true,
			message: 'Webhook data saved successfully',
			id: insertedId,
			order_id,
			utr,
			txn_id,
			status,
			amount: amountPaise
		});

	} catch (err) {
		console.error('Webhook error:', err);
		
		// Handle potential duplicate constraints
		const message = String(err && err.message ? err.message : '');
		
		if (message.includes('UNIQUE constraint failed')) {
			return json({
				success: false,
				error: 'Duplicate entry detected',
				code: 'DUPLICATE_ENTRY'
			}, 400);
		}

		return json({
			success: false,
			error: 'Internal server error'
		}, 500);
	}
}
