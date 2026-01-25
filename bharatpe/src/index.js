import { corsHeaders, addCors, json } from './utils';
import { handleNewOrder } from './handlers/newOrder';
import { handleAmount } from './handlers/amount';
import { processInstagramOrder, getSmmBalance } from './handlers/instagram';
import { handleOrders, handleOrderById, handleSearch } from './handlers/orders';
import {
	handlePaymentsSummary,
	handleSmmGrowthSummary,
	handleSmmGuruSummary,
	handleAuraGrowthSummary,
	handleSmmViewsSummary,
} from './handlers/payments';
import { handleTelegramWebhook } from './tgbot/handler';
import { handleRazorpayWebhook } from './handlers/rpWebhook';
import { handleWebhook } from './handlers/webhook';

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

		// New order endpoint
		if (pathname === '/neworder' && request.method === 'POST') {
			const res = await handleNewOrder(request, env);
			return addCors(res);
		}

		// Razorpay payment webhook endpoint: POST /rpwebhook
		if (pathname === '/rpwebhook' && request.method === 'POST') {
			const res = await handleRazorpayWebhook(request, env);
			return addCors(res);
		}

		// Generic webhook endpoint: POST /webhook
		if (pathname === '/webhook' && request.method === 'POST') {
			const res = await handleWebhook(request, env);
			return addCors(res);
		}

		// Direct Instagram processing endpoint (same logic as old worker)
		// GET /instagram?amount=...&link=...
		if (pathname === '/instagram' && request.method === 'GET') {
			const amount = url.searchParams.get('amount');
			const link = url.searchParams.get('link');
			const res = await processInstagramOrder(env, amount, link);
			return addCors(res);
		}

		// GET /balance - SMM panel balance (default: airgrow)
		if (pathname === '/balance' && request.method === 'GET') {
			const res = await getSmmBalance(env);
			return addCors(res);
		}

		// GET /balance/tntsmm - TNT SMM panel balance
		if (pathname === '/balance/tntsmm' && request.method === 'GET') {
			const res = await getSmmBalance(env, 'tntsmm');
			return addCors(res);
		}

		// GET /balance/supportivesmm - Supportive SMM panel balance
		if (pathname === '/balance/supportivesmm' && request.method === 'GET') {
			const res = await getSmmBalance(env, 'supportivesmm');
			return addCors(res);
		}

		// GET /balance/airgrow - Airgrow SMM panel balance
		if (pathname === '/balance/airgrow' && request.method === 'GET') {
			const res = await getSmmBalance(env, 'airgrow');
			return addCors(res);
		}

		// GET /balance/sakbasmm - Sabka SMM panel balance
		if (pathname === '/balance/sakbasmm' && request.method === 'GET') {
			const res = await getSmmBalance(env, 'sakbasmm');
			return addCors(res);
		}

		// Orders listing with pagination: GET /orders?page=1&limit=20
		if (pathname === '/orders' && request.method === 'GET') {
			const res = await handleOrders(request, env);
			return addCors(res);
		}

		// Payments summary endpoint: GET /payments
		if (pathname === '/payments' && request.method === 'GET') {
			const res = await handlePaymentsSummary(env);
			return addCors(res);
		}

		// Smmgrowth summary endpoint: GET /smmgrowth (remark = 'smmgrowth')
		if (pathname === '/smmgrowth' && request.method === 'GET') {
			const res = await handleSmmGrowthSummary(env);
			return addCors(res);
		}

		// Smmguru summary endpoint: GET /smmguru (remark = 'Smmguru')
		if (pathname === '/smmguru' && request.method === 'GET') {
			const res = await handleSmmGuruSummary(env);
			return addCors(res);
		}

		// Auragrowth summary endpoint: GET /auragrowth (remark = 'Auragrowth')
		if (pathname === '/auragrowth' && request.method === 'GET') {
			const res = await handleAuraGrowthSummary(env);
			return addCors(res);
		}

		// Smmviews summary endpoint: GET /smmviews (remark = 'Smmviews')
		if (pathname === '/smmviews' && request.method === 'GET') {
			const res = await handleSmmViewsSummary(env);
			return addCors(res);
		}

		// Telegram bot webhook endpoint: POST /tgbot
		// Configure Telegram webhook URL as: https://<your-worker-url>/tgbot
		if (pathname === '/tgbot' && request.method === 'POST') {
			const res = await handleTelegramWebhook(request, env);
			return addCors(res);
		}

		// Search endpoint: GET /search?query=...
		if (pathname === '/search' && request.method === 'GET') {
			const res = await handleSearch(request, env);
			return addCors(res);
		}

		// Single order by ID or apiid: GET /order/:id
		if (pathname.startsWith('/order/') && request.method === 'GET') {
			const parts = pathname.split('/');
			const id = parts[2] || '';
			if (!id) {
				return json({ success: false, error: 'Missing order id' }, 400);
			}
			const res = await handleOrderById(request, env, id);
			return addCors(res);
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

