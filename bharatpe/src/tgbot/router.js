// Router for Telegram updates. Decide which feature handler to call.

import { findOrderWithPayment } from './orderLookup';
import { sendTelegramMessage, deleteTelegramMessage } from './telegramApi';
import {
	startAdminSetup,
	handleAdminPasscode,
	getChatState,
	isChatAdmin,
	startBharatpeTokenUpdate,
	handleBharatpeTokenUpdateMessage,
	setChatState,
} from './admin';
import { processInstagramOrder } from '../handlers/instagram';

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

// Parse Instagram link and quantity from user message
function parseInstagramMessage(text) {
	const trimmedText = text.trim();
	
	// Look for Instagram URL followed by quantity
	const instagramUrlPattern = /(https?:\/\/(www\.)?instagram\.com\/[^\s]+)/i;
	const urlMatch = trimmedText.match(instagramUrlPattern);
	
	if (!urlMatch) return null;
	
	const url = urlMatch[1];
	const afterUrl = trimmedText.substring(urlMatch.index + urlMatch[0].length).trim();
	
	// Extract quantity from the remaining text
	const quantityMatch = afterUrl.match(/^(\d+)/);
	if (!quantityMatch) return null;
	
	const quantity = quantityMatch[1];
	
	return { url, quantity };
}

// Get service details based on link type
function getServiceDetails(url) {
	if (/instagram\.com\/reel\//i.test(url)) {
		return {
			serviceId: 6685,
			api: 'tntsmm',
			linkType: 'reel',
			serviceName: 'Reel Views'
		};
	} else if (/instagram\.com\/[^\/]+\/?(\?.*)?$/i.test(url)) {
		return {
			serviceId: 13787,
			api: 'sabkasmm',
			linkType: 'profile',
			serviceName: 'Followers'
		};
	}
	return null;
}

// Generate random transaction ID
function generateTxnId() {
	const length = Math.floor(Math.random() * 3) + 7; // 7-9 digits
	let result = '';
	for (let i = 0; i < length; i++) {
		result += Math.floor(Math.random() * 10);
	}
	return result;
}

// Place order via internal API
async function placeOrder(env, orderData) {
	try {
		console.log('[TG] Placing order with data:', JSON.stringify(orderData, null, 2));
		
		// Get service details based on link type
		const serviceDetails = getServiceDetails(orderData.link);
		
		if (!serviceDetails) {
			return { success: false, error: 'Invalid Instagram link type' };
		}
		
		// Fixed pricing based on service type
		let pricePerUnit;
		if (serviceDetails.linkType === 'reel') {
			pricePerUnit = 7 / 5000; // ₹7 for 5000 reel views = ₹0.0014 per view
		} else {
			pricePerUnit = 8 / 50; // ₹8 for 50 followers = ₹0.16 per follower
		}
		
		const requestedQuantity = parseInt(orderData.quantity.split(' ')[0]);
		// Enforce quantity limits for Telegram orders
		if (serviceDetails.linkType === 'profile' && requestedQuantity > 200) {
			return {
				success: false,
				error: 'Madharchod 200 se jyada nhi krna hai, Boss Ka Hukum.',
			};
		}
		if (serviceDetails.linkType === 'reel' && requestedQuantity > 1000000) {
			return {
				success: false,
				error: 'Madharchod 100K se jyada nhi krna hai, Boss Ka Hukum.',
			};
		}

		const calculatedAmount = pricePerUnit * requestedQuantity;

		// Choose service ID based on quantity for profile (followers) orders
		let finalServiceId = serviceDetails.serviceId;
		if (serviceDetails.linkType === 'profile') {
			if (requestedQuantity < 100) {
				// Small follower quantity -> SabkaSMM service
				finalServiceId = 13787;
			} else {
				// 100 or more followers -> SupportiveSMM service
				finalServiceId = 511;
			}
		}
		
		// Update order data with fixed service ID and calculated amount
		const updatedOrderData = {
			quantity: requestedQuantity.toString(), // Send only the number to SMM API
			link: orderData.link,
			amount: calculatedAmount,
			service: finalServiceId.toString(),
			txnId: generateTxnId()
		};
		
		console.log('[TG] Updated order data:', JSON.stringify(updatedOrderData, null, 2));
		
		// Call the handler directly instead of making HTTP request
		const { handleNewOrder } = await import('../handlers/newOrder.js');
		
		// Create a mock request object
		const mockRequest = {
			json: async () => updatedOrderData
		};
		
		const result = await handleNewOrder(mockRequest, env);
		const response = await result.json();
		
		console.log('[TG] Order response data:', response);
		
		return response;
	} catch (error) {
		console.error('[TG] Error placing order:', error);
		return { success: false, error: error.message || 'Failed to place order' };
	}
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
		} else if (panel === 'tnt') {
			apiKey = env.TNTSMM_API_KEY;
			baseUrl = env.TNTSMM_API_URL;
			label = 'tnt smm';
		} else if (panel === 'sakba') {
			apiKey = env.SAKBASMM_API_KEY;
			baseUrl = env.SAKBASMM_API_URL;
			label = 'sabka smm';
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

	// Group/supergroup commands (opt-in for pending order alerts and message cleanup)
	if (chatType === 'group' || chatType === 'supergroup') {
		// 5050 => register this group for pending order alerts
		if (lower === '5050') {
			try {
				await env.bharatpe
					.prepare(
						'CREATE TABLE IF NOT EXISTS tg_order_groups (\n' +
						"  chat_id TEXT PRIMARY KEY\n" +
						')'
					)
					.run();

				await env.bharatpe
					.prepare('INSERT OR IGNORE INTO tg_order_groups (chat_id) VALUES (?1)')
					.bind(String(chatId))
					.run();

				replyText = 'This group is now registered to receive orders where API Status is: Order Not Placed.';
			} catch (e) {
				console.log(
					'[TG] Failed to register group for order alerts',
					e && e.message ? e.message : e
				);
				replyText = 'Failed to register this group for pending order alerts.';
			}
		}
		// done / y / yes as a reply => delete the referenced NOT PLACED order notification (if possible)
		else if (lower === 'done' || lower === 'y' || lower === 'yes') {
			const replied = message?.reply_to_message;
			if (replied && replied.message_id && typeof replied.text === 'string') {
				// Only act on our own New Order notifications where API Status is 'Order Not Placed'
				const repliedText = replied.text;
				if (
					repliedText.includes('New Order Received') &&
					repliedText.includes('API Status: Order Not Placed')
				) {
					try {
						// Delete the notification message
						await deleteTelegramMessage(token, chatId, replied.message_id);

						// Track how many NOT PLACED orders this user has completed in this group
						const userId = message?.from?.id ? String(message.from.id) : null;
						if (userId) {
							const username = message.from.username || null;
							const firstName = message.from.first_name || null;

							// Ensure table exists
							await env.bharatpe
								.prepare(
									'CREATE TABLE IF NOT EXISTS tg_order_cleanup (\n' +
									"  chat_id TEXT,\n" +
									"  user_id TEXT,\n" +
									"  username TEXT,\n" +
									"  first_name TEXT,\n" +
									"  count INTEGER DEFAULT 0,\n" +
									"  PRIMARY KEY (chat_id, user_id)\n" +
									')'
								)
								.run();

							// Increment count for this user in this group
							await env.bharatpe
								.prepare(
									'INSERT INTO tg_order_cleanup (chat_id, user_id, username, first_name, count) VALUES (?1, ?2, ?3, ?4, 1)\n' +
									'ON CONFLICT(chat_id, user_id) DO UPDATE SET count = count + 1'
								)
								.bind(String(chatId), userId, username, firstName)
								.run();

							// Fetch updated count
							const row = await env.bharatpe
								.prepare(
									'SELECT count, username, first_name FROM tg_order_cleanup WHERE chat_id = ?1 AND user_id = ?2 LIMIT 1'
								)
								.bind(String(chatId), userId)
								.first();
							// We only store the updated count; no reply message is sent.
						}
					} catch (e) {
						console.log('[TG] Failed to delete replied message', e && e.message ? e.message : e);
					}
				}
			}
		}
		// Individual cleanup stats for this user in this group
		else if (lower === 'my') {
			try {
				const userId = message?.from?.id ? String(message.from.id) : null;
				if (!userId) {
					replyText = 'Could not identify you.';
				} else {
					// Ensure table exists (no-op if already created)
					await env.bharatpe
						.prepare(
							'CREATE TABLE IF NOT EXISTS tg_order_cleanup (\n' +
							"  chat_id TEXT,\n" +
							"  user_id TEXT,\n" +
							"  username TEXT,\n" +
							"  first_name TEXT,\n" +
							"  count INTEGER DEFAULT 0,\n" +
							"  PRIMARY KEY (chat_id, user_id)\n" +
							')'
						)
						.run();

					const row = await env.bharatpe
						.prepare(
							'SELECT count, username, first_name FROM tg_order_cleanup WHERE chat_id = ?1 AND user_id = ?2 LIMIT 1'
						)
						.bind(String(chatId), userId)
						.first();

					const completedCount = row?.count ?? 0;
					const displayName =
						row?.username
							? `@${row.username}`
							: row?.first_name
								? String(row.first_name)
								: 'You';

					replyText = `${displayName}\nOrder completed: ${completedCount}`;
				}
			} catch (e) {
				console.log('[TG] Failed to fetch individual cleanup stats', e && e.message ? e.message : e);
				replyText = 'Failed to fetch your stats.';
			}
		}
		// Group cleanup stats
		else if (lower === 'stats') {
			try {
				// Ensure table exists (no-op if already created)
				await env.bharatpe
					.prepare(
						'CREATE TABLE IF NOT EXISTS tg_order_cleanup (\n' +
						"  chat_id TEXT,\n" +
						"  user_id TEXT,\n" +
						"  username TEXT,\n" +
						"  first_name TEXT,\n" +
						"  count INTEGER DEFAULT 0,\n" +
						"  PRIMARY KEY (chat_id, user_id)\n" +
						')'
					)
					.run();

				const { results } = await env.bharatpe
					.prepare(
						'SELECT user_id, username, first_name, count FROM tg_order_cleanup WHERE chat_id = ?1 ORDER BY count DESC LIMIT 10'
					)
					.bind(String(chatId))
					.all();

				if (!results || !results.length) {
					replyText = 'No completed NOT PLACED orders recorded yet.';
				} else {
					const lines = ['Order cleanup stats', ''];
					results.forEach((row, idx) => {
						const displayName = row.username
							? `@${row.username}`
							: row.first_name
								? String(row.first_name)
								: `User ${idx + 1}`;
						lines.push(`${idx + 1}. ${displayName} - ${row.count} orders`);
					});
					replyText = lines.join('\n');
				}
			} catch (e) {
				console.log('[TG] Failed to fetch cleanup stats', e && e.message ? e.message : e);
				replyText = 'Failed to fetch stats.';
			}
		}
		// Simple greeting in group
		else if (lower === 'hi' || lower === 'hello') {
			replyText = 'hello';
		}
	}
	// Private DM commands
	else if (chatType === 'private') {
		// 0) If chat is in a state (e.g. awaiting_passcode), handle that first
		const state = await getChatState(env, chatId);
		if (state === 'awaiting_passcode') {
			console.log('[TG] Handling admin passcode for chat', chatId);
			replyText = await handleAdminPasscode(env, message, text);
		} else if (state === 'awaiting_bharatpe_token') {
			console.log('[TG] Handling BharatPe token update for chat', chatId);
			replyText = await handleBharatpeTokenUpdateMessage(env, message, text);
		} else if (state && state.includes('instagram_order')) {
			// Handle Instagram order confirmation
			console.log('[TG] Handling Instagram order confirmation for chat', chatId);
			if (lower === 'y' || lower === 'yes') {
				try {
					const orderData = JSON.parse(state);
					console.log('[TG] Placing Instagram order:', orderData);
					
					const result = await placeOrder(env, orderData);
					
					if (result.success) {
						replyText = `Order placed successfully! Order ID: ${result.order_id}`;
					} else {
						replyText = `Failed to place order: ${result.error || 'Unknown error'}`;
					}
				} catch (error) {
					console.error('[TG] Error placing Instagram order:', error);
					replyText = 'Failed to place order. Please try again.';
				}
				
				// Clear the state
				await setChatState(env, chatId, null);
			} else {
				// Clear the state and show cancellation message
				await setChatState(env, chatId, null);
				replyText = 'Order cancelled. You can send a new Instagram link with quantity to place a new order.';
			}
		}
		// 1) Start admin setup
		else if (lower === 'admin') {
			console.log('[TG] Admin setup command detected');
			replyText = await startAdminSetup(env, message);
		}
		// 1b) Start BharatPe token update (admin only)
		else if (lower === 'token') {
			console.log('[TG] BharatPe token update command detected');
			replyText = await startBharatpeTokenUpdate(env, message);
		}
		// 2) Balance-related commands
		else if (['balance', 'amount', 'check', 'b'].includes(lower)) {
			console.log('[TG] Balance command detected');
			const [airgrow, supportive, tnt, sakba] = await Promise.all([
				fetchPanelBalance(env, 'airgrow'),
				fetchPanelBalance(env, 'supportive'),
				fetchPanelBalance(env, 'tnt'),
				fetchPanelBalance(env, 'sakba'),
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

			if (tnt.ok) {
				lines.push(
					`TNT: ${formatBal(tnt.balance)} ${tnt.currency}`
				);
			} else {
				lines.push(`TNT: Error - ${tnt.error}`);
			}

			if (sakba.ok) {
				lines.push(
					`Sabka: ${formatBal(sakba.balance)} ${sakba.currency}`
				);
			} else {
				lines.push(`Sabka: Error - ${sakba.error}`);
			}

			replyText = lines.join('\n');
		}
		// 3) Instagram order - check for Instagram link with quantity
		else {
			const instagramData = parseInstagramMessage(text);
			if (instagramData) {
				console.log('[TG] Instagram order detected', instagramData);
				const serviceDetails = getServiceDetails(instagramData.url);
				
				if (serviceDetails) {
					// Store pending order in chat state
					await setChatState(env, chatId, JSON.stringify({
						type: 'instagram_order',
						quantity: `${instagramData.quantity} ${serviceDetails.serviceName}`,
						link: instagramData.url,
						amount: 0,
						service: 'Instagram',
						txnId: ''
					}));
					
					replyText = `Quantity: ${instagramData.quantity} ${serviceDetails.serviceName}
Link: <code>${instagramData.url}</code>

Send y or yes to confirm`;
				} else {
					replyText = 'Invalid Instagram link format. Please send a valid Instagram reel or profile link followed by quantity.';
				}
			}
			// 4) Numeric => order lookup (order_id / apiid / utr)
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
					];

					replyText = lines.join('\n');
				}
			}
			// 5) Greetings
			else if (lower === 'hi' || lower === 'hello') {
				replyText = 'hello';
			}
			// 6) Anything else => simple help
			else {
				replyText = [
					'How to use this bot:',
					'',
					'1) Send an order id / api id / UTR (only digits) to get order details.',
					'2) Send "balance", "amount", "check" or "b" to see SMM panel balances.',
					'3) Send Instagram link with quantity (e.g., https://instagram.com/reel/xyz 1000)',
				].join('\n');
			}
		}
	}

	if (!replyText) {
		return;
	}

	console.log('[TG] Sending reply to chat', chatId, '=>', replyText);
	await sendTelegramMessage(token, chatId, replyText);
}
