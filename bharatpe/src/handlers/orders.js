import { json } from '../utils';

// Handler for GET /orders?page=1&limit=20
export async function handleOrders(request, env) {
	const url = new URL(request.url);
	const pageParam = url.searchParams.get('page') || '1';
	const limitParam = url.searchParams.get('limit') || '20';

	const page = Math.max(1, Number(pageParam) || 1);
	const limit = Math.max(1, Math.min(100, Number(limitParam) || 20)); // cap at 100
	const offset = (page - 1) * limit;

	// Total count
	const totalRow = await env.bharatpe
		.prepare('SELECT COUNT(*) AS cnt FROM orders')
		.first();
	const total = Number(totalRow?.cnt || 0);
	const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

	// Paged data - newest first
	const { results } = await env.bharatpe
		.prepare(
			`SELECT order_id, quantity, link, amount, service, apiid, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT ?1 OFFSET ?2`
		)
		.bind(limit, offset)
		.all();

	const data = (results || []).map((row) => ({
		id: row.order_id,
		quantity: row.quantity,
		link: row.link,
		amount: row.amount != null ? row.amount / 100 : null, // store in rupees
		service: row.service,
		created_at: row.created_at,
		apiid: row.apiid ?? null,
	}));

	return json({
		page,
		limit,
		total,
		total_pages: totalPages,
		data,
	});
}

// Handler for GET /order/:id  (by order_id OR apiid)
export async function handleOrderById(request, env, idParam) {
	const id = idParam;

	const row =
		(await env.bharatpe
			.prepare(
				`SELECT order_id, quantity, link, amount, service, apiid, created_at
         FROM orders
         WHERE order_id = ?1
         LIMIT 1`
			)
			.bind(id)
			.first()) ||
		(await env.bharatpe
			.prepare(
				`SELECT order_id, quantity, link, amount, service, apiid, created_at
         FROM orders
         WHERE apiid = ?1
         LIMIT 1`
			)
			.bind(id)
			.first());

	if (!row) {
		return json(
			{
				success: false,
				error: 'Order not found',
			},
			404
		);
	}

	return json({
		id: row.order_id,
		quantity: row.quantity,
		link: row.link,
		amount: row.amount != null ? row.amount / 100 : null,
		service: row.service,
		created_at: row.created_at,
		apiid: row.apiid ?? null,
	});
}

// Handler for GET /search?query=... (search by order_id, apiid, or utr)
export async function handleSearch(request, env) {
	const url = new URL(request.url);
	const query = url.searchParams.get('query');

	if (!query) {
		return json({ success: false, error: 'Missing query parameter' }, 400);
	}

	// Try 1: Search by order_id in orders table
	let row = await env.bharatpe
		.prepare(
			`SELECT order_id, quantity, link, amount, service, apiid, created_at
       FROM orders
       WHERE order_id = ?1
       LIMIT 1`
		)
		.bind(query)
		.first();

	// Try 2: Search by apiid in orders table
	if (!row) {
		row = await env.bharatpe
			.prepare(
				`SELECT order_id, quantity, link, amount, service, apiid, created_at
         FROM orders
         WHERE apiid = ?1
         LIMIT 1`
			)
			.bind(query)
			.first();
	}

	// Try 3: Search by utr in transactions table, then find order via orderId
	if (!row) {
		const transaction = await env.bharatpe
			.prepare(`SELECT orderId FROM transactions WHERE utr = ?1 LIMIT 1`)
			.bind(query)
			.first();

		if (transaction && transaction.orderId) {
			row = await env.bharatpe
				.prepare(
					`SELECT order_id, quantity, link, amount, service, apiid, created_at
           FROM orders
           WHERE order_id = ?1
           LIMIT 1`
				)
				.bind(transaction.orderId)
				.first();
		}
	}

	if (!row) {
		return json(
			{
				success: false,
				error: 'No results found',
			},
			404
		);
	}

	return json({
		data: {
			id: row.order_id,
			apiid: row.apiid ?? null,
			quantity: row.quantity,
			link: row.link,
			amount: row.amount != null ? row.amount / 100 : null,
			service: row.service,
			created_at: row.created_at,
		},
	});
}

