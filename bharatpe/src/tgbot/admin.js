import { sendTelegramMessage } from './telegramApi';

function nowSeconds() {
	return Math.floor(Date.now() / 1000);
}

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

export async function getChatState(env, chatId) {
	const row = await env.bharatpe
		.prepare('SELECT state FROM tg_state WHERE chat_id = ?1 LIMIT 1')
		.bind(String(chatId))
		.first();
	return row ? row.state : null;
}

export async function setChatState(env, chatId, state) {
	if (!state) {
		await env.bharatpe
			.prepare('DELETE FROM tg_state WHERE chat_id = ?1')
			.bind(String(chatId))
			.run();
		return;
	}

	await env.bharatpe
		.prepare(
			'INSERT INTO tg_state (chat_id, state, updated_at) VALUES (?1, ?2, ?3)\n' +
			'	ON CONFLICT(chat_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at'
		)
		.bind(String(chatId), state, nowSeconds())
		.run();
}

export async function startAdminSetup(env, message) {
	const chatId = message.chat.id;
	await setChatState(env, chatId, 'awaiting_passcode');
	return 'Enter passcode';
}

export async function handleAdminPasscode(env, message, text) {
	const chatId = message.chat.id;
	const username = message.from?.username || null;
	const firstName = message.from?.first_name || null;

	// Passcode: prefer env override, fallback to default 802133
	const expected = env.TELEGRAM_ADMIN_PASSCODE || '802133';

	if (text.trim() !== String(expected)) {
		// Wrong passcode, clear state but do not promote
		await setChatState(env, chatId, null);
		return 'Invalid passcode.';
	}

	// Correct passcode -> insert admin
	await env.bharatpe
		.prepare(
			'INSERT OR IGNORE INTO tg_admins (chat_id, username, first_name, created_at) VALUES (?1, ?2, ?3, ?4)'
		)
		.bind(String(chatId), username, firstName, nowSeconds())
		.run();

	await setChatState(env, chatId, null);
	return "You're now an admin and will get notifications.";
}

export async function isChatAdmin(env, chatId) {
	const row = await env.bharatpe
		.prepare('SELECT 1 AS is_admin FROM tg_admins WHERE chat_id = ?1 LIMIT 1')
		.bind(String(chatId))
		.first();
	return !!row;
}

export async function startBharatpeTokenUpdate(env, message) {
	const chatId = message.chat.id;
	const isAdmin = await isChatAdmin(env, chatId);
	if (!isAdmin) {
		return 'You are not an admin.';
	}

	// Fetch current token from DB
	let currentToken = null;
	try {
		const row = await env.bharatpe
			.prepare('SELECT token FROM tg_bharatpe_token WHERE id = 1 LIMIT 1')
			.first();
		currentToken = row?.token || null;
	} catch (e) {
		console.log('[TG] Failed to read current BharatPe token from DB', e);
	}

	await setChatState(env, chatId, 'awaiting_bharatpe_token');
	const shown = currentToken || '<not set>';
	return (
		`Your token: ${shown}\n` +
		'Send a new one if you want to update it.'
	);
}

export async function handleBharatpeTokenUpdateMessage(env, message, text) {
	const chatId = message.chat.id;
	const isAdmin = await isChatAdmin(env, chatId);
	if (!isAdmin) {
		await setChatState(env, chatId, null);
		return 'You are not an admin.';
	}

	const newToken = text.trim();
	if (!newToken) {
		await setChatState(env, chatId, null);
		return 'Token cannot be empty.';
	}
	if (newToken.length < 32) {
		await setChatState(env, chatId, null);
		return 'Invalid token. It looks too short.';
	}

	await env.bharatpe
		.prepare(
			'INSERT INTO tg_bharatpe_token (id, token, updated_at) VALUES (1, ?1, ?2)\n' +
			'\tON CONFLICT(id) DO UPDATE SET token = excluded.token, updated_at = excluded.updated_at'
		)
		.bind(newToken, nowSeconds())
		.run();

	await setChatState(env, chatId, null);
	return 'bharatpe token updated';
}

export async function notifyAdminsOnNewOrder(env, order) {
	const token = env.TELEGRAM_BOT_TOKEN;
	if (!token) return;

	// Ensure tg_order_groups table exists for group notifications
	await env.bharatpe
		.prepare(
			'CREATE TABLE IF NOT EXISTS tg_order_groups (\n' +
			"  chat_id TEXT PRIMARY KEY\n" +
			')'
		)
		.run();

	const { results } = await env.bharatpe
		.prepare('SELECT chat_id FROM tg_admins')
		.all();

	if (!results || !results.length) return;

	const createdAtSec = Number(order.created_at || 0);
	const istHuman = createdAtSec ? formatIstHuman(createdAtSec) : 'N/A';

	let apiStatus;
	if (!order.apiid) {
		apiStatus = 'Order Not Placed';
	} else if (String(order.apiid) === 'failed') {
		apiStatus = 'Order Not Placed';
	} else {
		apiStatus = `<code>${escapeHtml(order.apiid)}</code>`;
	}

	const amountText = (() => {
		if (order.amountRupees != null) {
			return `Amount: \u20b9${escapeHtml(order.amountRupees)}`;
		}
		if (order.amountPaise != null) {
			const rupees = Number(order.amountPaise) / 100;
			return `Amount: \u20b9${escapeHtml(rupees)}`;
		}
		return `Amount: \u20b90`;
	})();

	// Format link: if it looks like a URL, show as plain text; otherwise keep monospace
	const rawLink = order.link ?? 'N/A';
	const safeLink = escapeHtml(rawLink);
	const linkIsUrl = /^https?:\/\//i.test(String(rawLink));
	const linkLine = linkIsUrl
		? `Link: ${safeLink}`
		: `Link: <code>${safeLink}</code>`;

	const lines = [
		'New Order Received',
		'',
		`Order ID: <code>${escapeHtml(order.id)}</code>`,
		`Quantity: ${escapeHtml(order.quantity ?? 'N/A')}`,
		linkLine,
		amountText,
		`Service: ${escapeHtml(order.service ?? 'N/A')}`,
		`Created At: ${escapeHtml(istHuman)}`,
		'',
		`API Status: ${apiStatus}`,
	];

	const text = lines.join('\n');

	// Base recipients: all admins
	const adminChatIds = results.map((row) => String(row.chat_id));

	// Extra recipients: groups that opted-in for NOT PLACED order alerts
	let groupChatIds = [];
	if (apiStatus === 'Order Not Placed') {
		// Send to groups for any service where amount matches the configured price list
		// and API order is not placed.
		const amountRupees =
			order.amountRupees != null
				? Number(order.amountRupees)
				: order.amountPaise != null
					? Number(order.amountPaise) / 100
					: null;
		// Allowed price points from services.js: 7, 8, 12, 25, 30, 35, 45
		const allowedPrices = [7, 8, 12, 13, 25, 30, 35, 45];
		const isAllowedPrice =
			amountRupees != null && !Number.isNaN(amountRupees) && allowedPrices.includes(amountRupees);

		if (isAllowedPrice) {
			const { results: groupResults } = await env.bharatpe
				.prepare('SELECT chat_id FROM tg_order_groups')
				.all();
			groupChatIds = (groupResults || []).map((row) => String(row.chat_id));
		} else {
			groupChatIds = [];
		}
	}

	// Deduplicate chat IDs (in case a group is also an admin chat)
	const allTargets = Array.from(new Set([...adminChatIds, ...groupChatIds]));

	await Promise.all(
		allTargets.map((chatId) =>
			sendTelegramMessage(token, chatId, text).catch((err) => {
				console.log('[TG] notifyAdminsOnNewOrder error for chat', chatId, err);
			})
		)
	);
}

export async function notifyAdminsOnBharatpeUnauthorized(env, details) {
	const token = env.TELEGRAM_BOT_TOKEN;
	if (!token) return;

	const { results } = await env.bharatpe
		.prepare('SELECT chat_id FROM tg_admins')
		.all();

	if (!results || !results.length) return;

	const safeDetails = details ? String(details) : '';
	const lines = [
		'BharatPe API Unauthorized (401)',
		'',
		'The BharatPe API returned 401 UNAUTHORIZED.',
		'',
		safeDetails,
	];

	const text = lines.join('\n');

	await Promise.all(
		results.map((row) =>
			sendTelegramMessage(token, row.chat_id, text).catch((err) => {
				console.log('[TG] notifyAdminsOnBharatpeUnauthorized error for chat', row.chat_id, err);
			})
		)
	);
}
