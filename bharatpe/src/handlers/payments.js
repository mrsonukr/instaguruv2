import { json } from '../utils';

// Handler for GET /payments - summary + last 3 days detail
export async function handlePaymentsSummary(env) {
	// Overall summary
	const summaryRow = await env.bharatpe
		.prepare(
			`SELECT COUNT(*) AS total_transactions,
              COALESCE(SUM(amount_paise), 0) AS total_amount_paise
       FROM transactions`
		)
		.first();

	const totalTransactions = Number(summaryRow?.total_transactions || 0);
	const totalAmountPaise = Number(summaryRow?.total_amount_paise || 0);

	// Last 3 days (rolling 72 hours) detailed
	const now = Date.now();
	const threeDaysAgoMs = now - 3 * 24 * 60 * 60 * 1000;

	const { results: recent } = await env.bharatpe
		.prepare(
			`SELECT utr, amount_paise, payer_name, payer, timestamp_ms
       FROM transactions
       WHERE timestamp_ms >= ?1
       ORDER BY timestamp_ms DESC`
		)
		.bind(threeDaysAgoMs)
		.all();

	// Group by date (YYYY-MM-DD)
	const last3ByDate = new Map();
	for (const row of recent || []) {
		const ts = Number(row.timestamp_ms);
		const d = new Date(ts);
		const dateStr = d.toISOString().slice(0, 10);

		if (!last3ByDate.has(dateStr)) {
			last3ByDate.set(dateStr, {
				date: dateStr,
				transactions: 0,
				amountPaise: 0,
				payments: [],
			});
		}

		const bucket = last3ByDate.get(dateStr);
		bucket.transactions += 1;
		bucket.amountPaise += Number(row.amount_paise || 0);

		bucket.payments.push({
			id: row.utr,
			amount: row.amount_paise != null ? Number(row.amount_paise) : null, // paise
			payer: row.payer,
			utr: row.utr,
			created_at: Math.floor(ts / 1000),
			payername: row.payer_name,
		});
	}

	// Convert map to sorted array (newest date first)
	const last3Days = Array.from(last3ByDate.values())
		.sort((a, b) => (a.date < b.date ? 1 : -1))
		.map((d) => ({
			date: d.date,
			transactions: d.transactions,
			amount: d.amountPaise, // paise
			payments: d.payments,
		}));

	// Older data (before 3 days) aggregated per date
	const { results: older } = await env.bharatpe
		.prepare(
			`SELECT
         strftime('%Y-%m-%d', timestamp_ms / 1000, 'unixepoch') AS date,
         COUNT(*) AS transactions,
         COALESCE(SUM(amount_paise), 0) AS amount_paise
       FROM transactions
       WHERE timestamp_ms < ?1
       GROUP BY date
       ORDER BY date DESC`
		)
		.bind(threeDaysAgoMs)
		.all();

	const olderData = (older || []).map((row) => ({
		date: row.date,
		transactions: Number(row.transactions || 0),
		amount: Number(row.amount_paise || 0), // paise
	}));

	return json({
		success: true,
		summary: {
			total_transactions: totalTransactions,
			total_amount: totalAmountPaise, // paise
		},
		last_3_days: last3Days,
		older_data: olderData,
	});
}


