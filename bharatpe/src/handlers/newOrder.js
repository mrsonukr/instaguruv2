import { json } from '../utils';
import { processInstagramOrder } from './instagram';
import { notifyAdminsOnNewOrder } from '../tgbot/admin';

// Handler for POST /neworder
export async function handleNewOrder(request, env) {
	try {
		const body = await request.json();
		const { id, quantity, link, amount, service } = body;

		if (!id || !quantity || !link || !amount || !service) {
			return json({ success: false, error: 'Missing fields' }, 400);
		}

		const amountPaise = Math.round(amount * 100);

		await env.bharatpe
			.prepare(
				`INSERT INTO orders 
        (order_id, quantity, link, amount, service, apiid, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, NULL, strftime('%s','now'))`
			)
			.bind(id, quantity, link, amountPaise, service)
			.run();

		// Also trigger Instagram/Airgrow processing (non-blocking for DB insert)
		const smmRes = await processInstagramOrder(env, amount, link);
		let smmJson;
		try {
			smmJson = await smmRes.json();
		} catch {
			smmJson = null;
		}

		// If SMM order succeeded, store its order id into apiid
		if (smmJson && smmJson.success && smmJson.orderId) {
			await env.bharatpe
				.prepare('UPDATE orders SET apiid = ? WHERE order_id = ?')
				.bind(smmJson.orderId, id)
				.run();
		}

		// Fire-and-forget: notify all Telegram admins about new order
		try {
			await notifyAdminsOnNewOrder(env, {
				id,
				quantity,
				link,
				amountRupees: amount,
				amountPaise,
				service,
			});
		} catch (e) {
			console.log('[TG] notifyAdminsOnNewOrder failed:', e && e.message ? e.message : e);
		}

		return json({
			success: true,
			message: 'Order saved',
			order_id: id,
			amount_paise: amountPaise,
			smm: smmJson || null,
		});
	} catch (err) {
		const message = String(err && err.message ? err.message : '');

		// Handle duplicate order_id (UNIQUE constraint) gracefully
		if (message.includes('UNIQUE constraint failed: orders.order_id')) {
			return json(
				{
					success: false,
					error: 'Order with this ID already exists',
					code: 'ORDER_ID_EXISTS',
				},
				400
			);
		}

		// Generic fallback error (hide internal D1/SQL details)
		return json(
			{
				success: false,
				error: 'Something went wrong while creating the order',
			},
			500
		);
	}
}


