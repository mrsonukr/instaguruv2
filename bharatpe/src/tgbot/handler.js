import { json } from '../utils';
import { routeUpdate } from './router';

// Main Telegram bot webhook handler
// Thin wrapper: parse request body, basic validation, delegate to router
export async function handleTelegramWebhook(request, env) {
	try {
		console.log('[TG] Webhook hit');
		const update = await request.json();
		console.log('[TG] Raw update:', JSON.stringify(update));

		// If no message object, nothing to do (Telegram may send other update types)
		if (!update || !update.message) {
			console.log('[TG] No message field on update, skipping');
			return json({ success: true, skipped: true });
		}

		// Delegate all logic to router (which will call specific feature handlers)
		await routeUpdate(update, env);
		console.log('[TG] routeUpdate completed successfully');

		// Telegram expects fast 200 OK
		return json({ success: true });
	} catch (err) {
		console.log('[TG] Error in handleTelegramWebhook:', err && err.stack ? err.stack : err);
		return json(
			{ success: false, error: 'Failed to process Telegram update' },
			500
		);
	}
}
