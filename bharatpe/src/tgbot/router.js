// Router for Telegram updates. Decide which feature handler to call.

import { findOrderWithPayment } from './orderLookup';
import { sendTelegramMessage } from './telegramApi';
import { startAdminSetup, handleAdminPasscode, getChatState } from './admin';

function escapeHtml(str) {
	if (str === null || str === undefined) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function formatIstHuman(createdAtSec) {
	if (!createdAtSec) return 'N/A';
	const date = new Date(createdAtSec * 1000);
	// Convert to IST components
	const ist = new Date(
		date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
	);

	const pad = (n) => String(n).padStart(2, '0');
	const y = ist.getFullYear();
	const m = ist.getMonth() + 1;
	const d = ist.getDate();
	const h = ist.getHours();
	const min = ist.getMinutes();
	const s = ist.getSeconds();

	const today = new Date(
		new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
	);
	const ty = today.getFullYear();
	const tm = today.getMonth() + 1;
	const td = today.getDate();

	// Yesterday in IST
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const yy = yesterday.getFullYear();
	const ym = yesterday.getMonth() + 1;
	const yd = yesterday.getDate();

	const timePart = `${pad(h)}:${pad(min)}:${pad(s)}`;

	if (y === ty && m === tm && d === td) {
		return `Today, ${timePart}`;
	}
	if (y === yy && m === ym && d === yd) {
		return `Yesterday, ${timePart}`;
	}

	return `${pad(d)}/${pad(m)}/${y}, ${timePart}`;
}

async function fetchPanelBalance(env, panel) {
	try {
		let apiKey;
		let baseUrl;
		let label;

		if (panel === 'airgrow') {
			apiKey = env.AIRGROWSMM_API_KEY;
			baseUrl = env.AIRGROWSMM_API_URL;
			label = 'air grow smm';
		} else if (panel === 'supportive') {
			apiKey = env.SUPPORTIVESMM_API_KEY;
			baseUrl = env.SUPPORTIVESMM_API_URL;
			label = 'supportive smm';
		} else {
			return { ok: false, error: 'Unknown panel' };
		}

		if (!apiKey || !baseUrl) {
			return { ok: false, error: 'API not configured' };
		}

		const apiUrl = `${baseUrl}?key=${apiKey}&action=balance`;
		const res = await fetch(apiUrl);
		const data = await res.json();

		// Most SMM panels return { balance: number, currency: 'INR', ... }
		const balance = data.balance;
		const currency = data.currency || 'INR';
		return { ok: true, label, balance, currency };
	} catch (err) {
		return { ok: false, error: err?.message || String(err) };
	}
}

export async function routeUpdate(update, env) {
	const message = update?.message;
	const chatId = message?.chat?.id;
	const chatType = message?.chat?.type;
	const text = (message?.text || '').trim();
	console.log('[TG] routeUpdate: chatId=', chatId, 'type=', chatType, 'text=', text);

	if (!chatId) {
		return;
	}

	const token = env.TELEGRAM_BOT_TOKEN;
	if (!token) {
		return;
	}

	let replyText = '';
	const lower = text.toLowerCase();

	// Private DM commands
	if (chatType === 'private') {
		// 0) If chat is in a state (e.g. awaiting_passcode), handle that first
		const state = await getChatState(env, chatId);
		if (state === 'awaiting_passcode') {
			console.log('[TG] Handling admin passcode for chat', chatId);
			replyText = await handleAdminPasscode(env, message, text);
		}
		// 1) Start admin setup
		else if (lower === 'admin') {
			console.log('[TG] Admin setup command detected');
			replyText = await startAdminSetup(env, message);
		}
		// 2) Balance-related commands
		else if (['balance', 'amount', 'check', 'b'].includes(lower)) {
			console.log('[TG] Balance command detected');
			const [airgrow, supportive] = await Promise.all([
				fetchPanelBalance(env, 'airgrow'),
				fetchPanelBalance(env, 'supportive'),
			]);

			const formatBal = (v) => {
				if (v === null || v === undefined || isNaN(Number(v))) return '0.00';
				return Number(v).toFixed(2);
			};

			const lines = ['SMM Balances', ''];

			if (airgrow.ok) {
				lines.push(
					`Airgrow: ${formatBal(airgrow.balance)} ${airgrow.currency}`
				);
			} else {
				lines.push(`Airgrow: Error - ${airgrow.error}`);
			}

			if (supportive.ok) {
				lines.push(
					`Supportive: ${formatBal(supportive.balance)} ${supportive.currency}`
				);
			} else {
				lines.push(`Supportive: Error - ${supportive.error}`);
			}

			replyText = lines.join('\n');
		}
		// 2) Numeric => order lookup (order_id / apiid / utr)
		else if (/^\d+$/.test(text)) {
			console.log('[TG] Numeric DM detected, query=', text);
			const query = text;
			const result = await findOrderWithPayment(env, query);

			if (!result) {
				console.log('[TG] Order lookup: no result');
				replyText = 'Order not found';
			} else {
			console.log('[TG] Order lookup: found result');
			const createdAtSec = Number(result.created_at || 0);
			const istHuman = createdAtSec ? formatIstHuman(createdAtSec) : 'N/A';

			const apiStatus = result.apiid
				? `<code>${escapeHtml(result.apiid)}</code>`
				: 'Order Not Placed';

			const lines = [
				'Order Details',
				'',
				`Order ID: <code>${escapeHtml(result.id)}</code>`,
				`Quantity: ${escapeHtml(result.quantity ?? 'N/A')}`,
				`Link: <code>${escapeHtml(result.link ?? 'N/A')}</code>`,
				`Amount: \u20b9${result.amount != null ? escapeHtml(result.amount) : '0'}`,
				`Service: ${escapeHtml(result.service ?? 'N/A')}`,
				`Created At: ${escapeHtml(istHuman)}`,
				'',
				`API Status: ${apiStatus}`,
				'',
				`Payer Name: ${escapeHtml(result.payername ?? 'N/A')}`,
				`Payer: ${escapeHtml(result.payer ?? 'N/A')}`,
				`UTR: ${result.utr ? `<code>${escapeHtml(result.utr)}</code>` : 'N/A'}`,
			];

			replyText = lines.join('\n');
		}
		}
		// 3) Greetings
		else if (lower === 'hi' || lower === 'hello') {
			replyText = 'hello';
		}
		// 4) Anything else => simple help
		else {
			replyText = [
				'How to use this bot:',
				'',
				'1) Send an order id / api id / UTR (only digits) to get order details.',
				'2) Send "balance", "amount", "check" or "b" to see SMM panel balances.',
			].join('\n');
		}
	}

	console.log('[TG] Sending reply to chat', chatId, '=>', replyText);
	await sendTelegramMessage(token, chatId, replyText);
}
