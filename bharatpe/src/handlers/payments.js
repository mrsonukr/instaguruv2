
import { json } from '../utils';

// Shared helper to build summary-style response from webhook with optional remark filter
async function buildPaymentsLikeSummary(env, remarkFilter = null) {
	// Overall summary from webhook table
	let summaryQuery = `SELECT COUNT(*) AS total_transactions,
	             COALESCE(SUM(amount), 0) AS total_amount
	      FROM webhook`;
	const summaryParams = [];
	if (remarkFilter) {
		summaryQuery += ` WHERE remark = ?1`;
		summaryParams.push(remarkFilter);
	}
	let summaryStmt = env.bharatpe.prepare(summaryQuery);
	if (summaryParams.length) {
		summaryStmt = summaryStmt.bind(...summaryParams);
	}
	const summaryRow = await summaryStmt.first();

	const totalTransactions = Number(summaryRow?.total_transactions || 0);
	const totalAmountPaise = Number(summaryRow?.total_amount || 0);

	// Last 3 days (rolling 72 hours) detailed from webhook table
	const nowMs = Date.now();
	const threeDaysAgoSec = Math.floor((nowMs - 3 * 24 * 60 * 60 * 1000) / 1000);
	// Compute "today" in IST (UTC+5:30) for labeling
	const nowIstMs = nowMs + 19800000; // 5.5 hours in ms
	const nowIstDateStr = new Date(nowIstMs).toISOString().slice(0, 10);

	let recentQuery = `SELECT order_id, utr, amount, remark, created_at
	      FROM webhook
	      WHERE created_at >= ?1`;
	const recentParams = [threeDaysAgoSec];
	if (remarkFilter) {
		recentQuery += ` AND remark = ?2`;
	}
	recentQuery += ` ORDER BY created_at DESC`;
	let recentStmt = env.bharatpe.prepare(recentQuery).bind(...recentParams, ...(remarkFilter ? [remarkFilter] : []));
	const { results: recent } = await recentStmt.all();

	// Group by date (YYYY-MM-DD) directly from created_at
	const last3ByDate = new Map();
	for (const row of recent || []) {
		const createdAtSec = Number(row.created_at);
		const createdAtMs = createdAtSec * 1000;
		// Shift to IST for display
		const istMs = createdAtMs + 19800000; // 5.5 hours
		const d = new Date(istMs);
		const dateStr = d.toISOString().slice(0, 10);

		// (Previously: built created_at_label here; no longer needed)

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
			remark: row.remark ?? null,
			created_at: createdAtSec,
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
	let olderQuery = `SELECT
	        -- Shift by +5:30 hours (19800 seconds) to get India date (IST)
	        strftime('%Y-%m-%d', created_at + 19800, 'unixepoch') AS date,
	        COUNT(*) AS transactions,
	        COALESCE(SUM(amount), 0) AS amount
	      FROM webhook
	      WHERE created_at < ?1`;
	const olderParams = [threeDaysAgoSec];
	if (remarkFilter) {
		olderQuery += ` AND remark = ?2`;
	}
	olderQuery += `
	      GROUP BY date
	      ORDER BY date DESC`;
	let olderStmt = env.bharatpe.prepare(olderQuery).bind(...olderParams, ...(remarkFilter ? [remarkFilter] : []));
	const { results: older } = await olderStmt.all();

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

// Handler for GET /payments - summary + last 3 days detail (all webhook rows)
export async function handlePaymentsSummary(env) {
	return buildPaymentsLikeSummary(env, null);
}

// Handler for GET /smmgrowth - same structure but only remark = 'smmgrowth'
export async function handleSmmGrowthSummary(env) {
	return buildPaymentsLikeSummary(env, 'Smmgrowth');
}
