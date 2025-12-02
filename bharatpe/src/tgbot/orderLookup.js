// Logic for looking up orders + payment info for Telegram bot flows

export async function findOrderWithPayment(env, query) {
	// 1) Try by order_id in orders
	let orderRow = await env.bharatpe
		.prepare(
			`SELECT order_id, quantity, link, amount, service, apiid, created_at
		   FROM orders
		   WHERE order_id = ?1
		   LIMIT 1`
		)
		.bind(query)
		.first();

	// 2) Try by apiid in orders
	if (!orderRow) {
		orderRow = await env.bharatpe
			.prepare(
				`SELECT order_id, quantity, link, amount, service, apiid, created_at
			   FROM orders
			   WHERE apiid = ?1
			   LIMIT 1`
			)
			.bind(query)
			.first();
	}

	let paymentRow = null;

	// 3) Try by utr in transactions; map to order via orderId
	if (!orderRow) {
		const transaction = await env.bharatpe
			.prepare(
				`SELECT utr, payer_name, payer, amount_paise, timestamp_ms, orderId
		   FROM transactions
		   WHERE utr = ?1
		   LIMIT 1`
			)
			.bind(query)
			.first();

		if (!transaction || !transaction.orderId) {
			return null;
		}

		orderRow = await env.bharatpe
			.prepare(
				`SELECT order_id, quantity, link, amount, service, apiid, created_at
		   FROM orders
		   WHERE order_id = ?1
		   LIMIT 1`
			)
			.bind(transaction.orderId)
			.first();

		if (!orderRow) {
			return null;
		}

		paymentRow = transaction;
	}

	// If we found order first (by order_id/apiid), try to fetch its latest transaction
	if (!paymentRow && orderRow) {
		paymentRow = await env.bharatpe
			.prepare(
				`SELECT utr, payer_name, payer, amount_paise, timestamp_ms, orderId
		   FROM transactions
		   WHERE orderId = ?1
		   ORDER BY timestamp_ms DESC
		   LIMIT 1`
			)
			.bind(orderRow.order_id)
			.first();
	}

	if (!orderRow) {
		return null;
	}

	return {
		id: orderRow.order_id,
		quantity: orderRow.quantity,
		link: orderRow.link,
		amount: orderRow.amount != null ? orderRow.amount / 100 : null,
		service: orderRow.service,
		created_at: orderRow.created_at,
		apiid: orderRow.apiid ?? null,
		payername: paymentRow ? paymentRow.payer_name : null,
		payer: paymentRow ? paymentRow.payer : null,
		utr: paymentRow ? paymentRow.utr : null,
	};
}
