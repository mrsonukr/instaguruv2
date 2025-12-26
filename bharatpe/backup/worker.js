// Common utilities: CORS + JSON helpers
function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': '*',
	};
}

function addCors(res) {
	const headers = new Headers(res.headers);
	headers.set('Access-Control-Allow-Origin', '*');
	headers.set('Access-Control-Allow-Headers', '*');
	headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	return new Response(res.body, { status: res.status, headers });
}

function json(obj, status = 200) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders(),
		},
	});
}

// Handler for /amount/:paise
async function handleAmount(env, amountRupees) {
	const amountPaise = amountRupees * 100;

	console.log('[BHARATPE] Calling proxy BharatPe API for amount', { amountPaise });

	// Fetch recent transactions from the proxy API
	const res = await fetch('https://apibp.mssonutech.workers.dev/', {
		// Ensure we always get fresh data and never use a cached response
		method: 'GET',
		cache: 'no-store',
		headers: {
			Accept: 'application/json',
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			Pragma: 'no-cache',
			Expires: '0',
		},
	});

	if (!res.ok) {
		return json({ success: false, error: 'Failed fetching BharatPe proxy API' });
	}

	const api = await res.json();
	const all = api?.data?.transactions || [];

	// Filter transactions for the requested amount.
	// Proxy API returns amount in rupees, so compare after normalizing.
	const filtered = all.filter((t) => {
		const amt = Number(t.amount);
		if (Number.isNaN(amt)) return false;
		return Math.round(amt * 100) === amountPaise;
	});

	if (filtered.length > 0) {
		// PICK OLDEST transaction from live data
		filtered.sort((a, b) => a.paymentTimestamp - b.paymentTimestamp); // ASC
		const candidate = filtered[0];

		// Ensure it exists in local DB with orderPlaced = 0
		await env.bharatpe
			.prepare(
				`INSERT INTO transactions
		       (utr, amount_paise, payer_name, payer, timestamp_ms, orderPlaced)
		       VALUES (?1, ?2, ?3, ?4, ?5, 0)
		       ON CONFLICT(utr) DO NOTHING`
			)
			.bind(
				candidate.bankReferenceNo,
				amountPaise,
				candidate.payerName,
				candidate.payerHandle,
				candidate.paymentTimestamp
			)
			.run();

		const saved = await env.bharatpe
			.prepare(`SELECT * FROM transactions WHERE utr = ? LIMIT 1`)
			.bind(candidate.bankReferenceNo)
			.first();

		// If this transaction is already used for an order (orderPlaced=1),
		// treat it as not available for new payments.
		if (!saved || saved.orderPlaced === 1) {
			return json({
				success: false,
				amount: amountPaise,
				message: 'Waiting for payment',
			});
		}

		return json({
			success: true,
			orderplaced: saved.orderPlaced === 1,
			amount: saved.amount_paise,
			payment_id: saved.utr,
			orderid: saved.orderId,
		});
	}

	// No live proxy match -> fallback to local DB for any pending transaction of this amount
	const fallback = await env.bharatpe
		.prepare(
			`SELECT * FROM transactions
	   WHERE amount_paise = ?1 AND orderPlaced = 0
	   ORDER BY timestamp_ms ASC
	   LIMIT 1`
		)
		.bind(amountPaise)
		.first();

	if (!fallback) {
		return json({
			success: false,
			amount: amountPaise,
			message: 'Waiting for payment',
		});
	}

	return json({
		success: true,
		orderplaced: fallback.orderPlaced === 1,
		amount: fallback.amount_paise,
		payment_id: fallback.utr,
		orderid: fallback.orderId,
	});
}

// Entry point / router
export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(),
			});
		}

		// Amount endpoint: /amount/:paise
		if (pathname.startsWith('/amount/')) {
			const amt = Number(pathname.split('/')[2]);
			if (!amt) return json({ success: false, error: 'Invalid amount' });

			// amt is paise; convert to rupees for internal logic
			const amountRupees = amt / 100;
			return await handleAmount(env, amountRupees);
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders() });
	},
};
