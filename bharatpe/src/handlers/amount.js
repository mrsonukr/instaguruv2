import { json } from '../utils';
import { notifyAdminsOnBharatpeUnauthorized } from '../tgbot/admin';

// Handler for /amount/:paise
export async function handleAmount(env, amountRupees) {
	const amountPaise = amountRupees * 100;

	// 2) FETCH NEW DATA FROM BHARATPE API (for all amounts)
	// WINDOW MINUTES controlled from wrangler vars: BHARATPE_WINDOW_MINUTES
	console.log('[BHARATPE] Calling BharatPe API for amount', { amountPaise });
	const windowMinutesRaw = env.BHARATPE_WINDOW_MINUTES ?? '5';
	const windowMinutes = Number(windowMinutesRaw) || 5;

	const now = new Date();
	const start = new Date(now.getTime() - windowMinutes * 60 * 1000);

	const apiUrl =
		`https://payments-tesseract.bharatpe.in/api/v1/merchant/transactions` +
		`?module=PAYMENT_QR&merchantId=${env.BHARATPE_MERCHANT_ID}` +
		`&sDate=${start.getTime()}&eDate=${now.getTime()}` +
		`&pageSize=100&pageCount=0&isFromOtDashboard=1`;

	const tokenRow = await env.bharatpe
		.prepare('SELECT token FROM tg_bharatpe_token WHERE id = 1 LIMIT 1')
		.first();

	const bharatpeToken = tokenRow?.token;
	if (!bharatpeToken) {
		return json({ success: false, error: 'BharatPe token not configured' });
	}

	const res = await fetch(apiUrl, {
		headers: {
			Accept: 'application/json',
			Token: bharatpeToken,
			Referer: 'https://enterprise.bharatpe.in/',
			Origin: 'https://enterprise.bharatpe.in/',
		},
	});

	if (!res.ok) {
		if (res.status === 401) {
			let bodyText = '';
			try {
				bodyText = await res.text();
			} catch (e) {
				bodyText = '<failed to read BharatPe body>';
			}

			try {
				const parsed = JSON.parse(bodyText);
				if (
					parsed &&
					parsed.responseCode === '401' &&
					parsed.responseMessage === 'You are not authorised'
				) {
					await notifyAdminsOnBharatpeUnauthorized(
						env,
						`Raw response: ${bodyText}`
					);
				}
			} catch (e) {
				console.log('[BHARATPE] Failed to parse 401 body', e);
			}
		}

		return json({ success: false, error: 'Failed fetching BharatPe' });
	}

	const api = await res.json();
	const all = api?.data?.transactions || [];

	// Filter by amount
	const filtered = all.filter((t) => t.amount * 100 === amountPaise);

	// 3) No BharatPe match → Show WAITING
	if (filtered.length === 0) {
		return json({
			success: false,
			amount: amountPaise,
			message: 'Waiting for payment',
		});
	}

	// 4) PICK OLDEST transaction
	filtered.sort((a, b) => a.paymentTimestamp - b.paymentTimestamp); // ASC
	const candidate = filtered[0];

	// 5) CHECK if already exists in DB
	const exist = await env.bharatpe
		.prepare(`SELECT orderId FROM transactions WHERE utr = ? LIMIT 1`)
		.bind(candidate.bankReferenceNo)
		.first();

	if (exist) {
		return json({
			success: false,
			amount: amountPaise,
			message: 'Waiting for payment',
		});
	}

	// 6) INSERT NEW → orderPlaced = 1
	await env.bharatpe
		.prepare(
			`INSERT INTO transactions
       (utr, amount_paise, payer_name, payer, timestamp_ms, orderPlaced)
       VALUES (?1, ?2, ?3, ?4, ?5, 1)
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

	// Fetch it back
	const saved = await env.bharatpe
		.prepare(`SELECT * FROM transactions WHERE utr = ? LIMIT 1`)
		.bind(candidate.bankReferenceNo)
		.first();

	return json({
		success: true,
		orderplaced: true,
		amount: amountPaise,
		payment_id: saved.utr,
		orderid: saved.orderId,
	});
}


