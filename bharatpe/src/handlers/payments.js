import { json } from '../utils';

// Handler for GET /payments - summary + last 3 days detail
export async function handlePaymentsSummary(env) {
	// Overall summary from webhook table
	const summaryRow = await env.bharatpe
		.prepare(
			`SELECT COUNT(*) AS total_transactions,
		             COALESCE(SUM(amount), 0) AS total_amount
	      FROM webhook`
			)
		.first();

	const totalTransactions = Number(summaryRow?.total_transactions || 0);
	const totalAmountPaise = Number(summaryRow?.total_amount || 0);

	// Last 3 days (rolling 72 hours) detailed from webhook table
	const nowMs = Date.now();
	const threeDaysAgoSec = Math.floor((nowMs - 3 * 24 * 60 * 60 * 1000) / 1000);
	// Compute "today" in UTC for labeling
	const nowUtcDateStr = new Date(nowMs).toISOString().slice(0, 10);

	const { results: recent } = await env.bharatpe
		.prepare(
			`SELECT order_id, utr, amount, created_at
	      FROM webhook
	      WHERE created_at >= ?1
	      ORDER BY created_at DESC`
			)
		.bind(threeDaysAgoSec)
		.all();

	// Group by date (YYYY-MM-DD) directly from created_at
	const last3ByDate = new Map();
	for (const row of recent || []) {
		const createdAtSec = Number(row.created_at);
		const createdAtMs = createdAtSec * 1000;
		// Use UTC directly for display
		const d = new Date(createdAtMs);
		const dateStr = d.toISOString().slice(0, 10);

		// Build human-readable label: "Today, 08:31 pm" or "YYYY-MM-DD, 08:31 pm"
		let hour = d.getUTCHours();
		const minute = d.getUTCMinutes();
		const ampm = hour >= 12 ? 'pm' : 'am';
		hour = hour % 12;
		if (hour === 0) hour = 12;
		const hourStr = hour < 10 ? `0${hour}` : String(hour);
		const minuteStr = minute < 10 ? `0${minute}` : String(minute);
		const timeStr = `${hourStr}:${minuteStr} ${ampm}`;
		const dayLabel = dateStr === nowUtcDateStr ? 'Today' : dateStr;
		const createdAtLabel = `${dayLabel}, ${timeStr}`;

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
		bucket.amountPaise += Number(row.amount || 0);

		bucket.payments.push({
			id: row.utr,
			amount: row.amount != null ? Number(row.amount) : null, // paise
			payer: 'BHIM',
			utr: row.utr,
			order_id: row.order_id,
			created_at: createdAtSec,
			created_at_label: createdAtLabel,
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

	// Older data (before 3 days) aggregated per date from webhook table (IST)
	const { results: older } = await env.bharatpe
		.prepare(
			`SELECT
	        -- Shift by +5:30 hours (19800 seconds) to get India date (IST)
	        strftime('%Y-%m-%d', created_at + 19800, 'unixepoch') AS date,
	        COUNT(*) AS transactions,
	        COALESCE(SUM(amount), 0) AS amount
	      FROM webhook
	      WHERE created_at < ?1
	      GROUP BY date
	      ORDER BY date DESC`
			)
		.bind(threeDaysAgoSec)
		.all();

	const olderData = (older || []).map((row) => ({
		date: row.date,
		transactions: Number(row.transactions || 0),
		amount: Number(row.amount || 0), // paise
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


