import { json } from '../utils';

// Handler for POST /rpwebhook (Razorpay payment webhook)
export async function handleRazorpayWebhook(request, env) {
	let body;
	try {
		body = await request.json();
	} catch (e) {
		return json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	// Basic validation
	if (!body || body.entity !== 'event' || !body.payload || !body.payload.payment) {
		return json({ success: false, error: 'Invalid Razorpay event payload' }, 400);
	}

	const payment = body.payload.payment.entity || {};
	const utr = payment?.acquirer_data?.rrn || null;
	const amountPaise = typeof payment.amount === 'number' ? payment.amount : null;
	const vpa = payment?.vpa || null;
	const createdAtSec = typeof body.created_at === 'number' ? body.created_at : payment.created_at;
	const timestampMs = typeof createdAtSec === 'number' ? createdAtSec * 1000 : Date.now();

	if (!utr || !amountPaise || !vpa) {
		return json({ success: false, error: 'Missing required payment fields' }, 400);
	}

	// Refined format
	const refined = {
		utr,
		amount_paise: amountPaise,
		payer_name: vpa,
		payer: 'UPI',
		timestamp_ms: timestampMs,
	};

	// Insert into D1 transactions table (orderPlaced = 0 for webhook payments)
	const insertPromise = env.bharatpe
		.prepare(
			`INSERT INTO transactions
       (utr, amount_paise, payer_name, payer, timestamp_ms, orderPlaced)
       VALUES (?1, ?2, ?3, ?4, ?5, 0)
       ON CONFLICT(utr) DO NOTHING`
		)
		.bind(refined.utr, refined.amount_paise, refined.payer_name, refined.payer, refined.timestamp_ms)
		.run();

	// Forward refined payload to external webhook
	const forwardPromise = fetch('https://smmapi.mssonutech.workers.dev/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(refined),
	}).catch((err) => {
		console.log('[RPWEBHOOK] Forward failed', err && err.message ? err.message : err);
	});

	try {
		await Promise.all([insertPromise, forwardPromise]);
	} catch (e) {
		// Even if forwarding fails, we mainly care about DB insert
		console.log('[RPWEBHOOK] Error processing webhook', e && e.message ? e.message : e);
	}

	return json({ success: true, data: refined });
}
