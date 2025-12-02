import { sendTelegramMessage } from './telegramApi';

function nowSeconds() {
	return Math.floor(Date.now() / 1000);
}

export async function getChatState(env, chatId) {
	const row = await env.bharatpe
		.prepare('SELECT state FROM tg_state WHERE chat_id = ?1 LIMIT 1')
		.bind(String(chatId))
		.first();
	return row ? row.state : null;
}

async function setChatState(env, chatId, state) {
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

export async function notifyAdminsOnNewOrder(env, order) {
	const token = env.TELEGRAM_BOT_TOKEN;
	if (!token) return;

	const { results } = await env.bharatpe
		.prepare('SELECT chat_id FROM tg_admins')
		.all();

	if (!results || !results.length) return;

	const lines = [
		'New Order',
		'',
		`Order ID: ${order.id}`,
		`Amount: ${order.amountRupees != null ? order.amountRupees : order.amountPaise}`,
		order.service ? `Service: ${order.service}` : null,
		order.link ? `Link: ${order.link}` : null,
	].filter(Boolean);

	const text = lines.join('\n');

	await Promise.all(
		results.map((row) =>
			sendTelegramMessage(token, row.chat_id, text).catch((err) => {
				console.log('[TG] notifyAdminsOnNewOrder error for chat', row.chat_id, err);
			})
		)
	);
}
