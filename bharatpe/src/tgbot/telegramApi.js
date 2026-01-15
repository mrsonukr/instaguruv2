// Telegram API helper functions

export async function sendTelegramMessage(token, chatId, text) {
	const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
	const payload = {
		chat_id: chatId,
		text,
		parse_mode: 'HTML',
	};

	const res = await fetch(telegramUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	let bodyText = '';
	try {
		bodyText = await res.text();
	} catch (e) {
		bodyText = '<failed to read body>';
	}

	console.log('[TG] Telegram sendMessage response:', res.status, bodyText);
}

export async function deleteTelegramMessage(token, chatId, messageId) {
	const telegramUrl = `https://api.telegram.org/bot${token}/deleteMessage`;
	const payload = {
		chat_id: chatId,
		message_id: messageId,
	};

	const res = await fetch(telegramUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	let bodyText = '';
	try {
		bodyText = await res.text();
	} catch (e) {
		bodyText = '<failed to read body>';
	}

	console.log('[TG] Telegram deleteMessage response:', res.status, bodyText);
}
