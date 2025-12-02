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

	console.log('[TG] Telegram API response:', res.status, bodyText);
}
