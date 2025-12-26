import { json } from '../utils';

// Handler for POST /webhook
export async function handleWebhook(request, env) {
	try {
		const body = await request.json();
		
		// Extract and filter required fields
		const {
			customer_mobile, // Note: typo in incoming data, but we don't store it
			utr,
			remark, // Not stored
			txn_id,
			create_at, // Note: incoming field name
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

		// Convert amount to integer (paise) and created_at to timestamp
		const amountPaise = Math.round(parseFloat(amount) * 100);
		let createdAtTimestamp;

		if (create_at) {
			// Parse the datetime string and convert to Unix timestamp
			const date = new Date(create_at);
			createdAtTimestamp = Math.floor(date.getTime() / 1000);
		} else {
			// Fallback to current time
			createdAtTimestamp = Math.floor(Date.now() / 1000);
		}

		// Insert into webhook table
		const result = await env.bharatpe
			.prepare(
				`INSERT INTO webhook 
				        (order_id, utr, txn_id, status, amount, created_at)
				         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
			)
			.bind(order_id, utr, txn_id, status, amountPaise, createdAtTimestamp)
			.run();

		// Get the inserted record ID
		const insertedId = result.meta.last_row_id;

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
