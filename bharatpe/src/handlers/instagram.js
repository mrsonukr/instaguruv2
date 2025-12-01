import { json } from '../utils';

// Shared Instagram/Airgrow SMM processing logic
// Used by: /neworder + /instagram endpoint
export async function processInstagramOrder(env, amount, link) {
	const apiKey = env.AIRGROWSMM_API_KEY;

	if (!apiKey) {
		return json(
			{
				success: false,
				error: 'SMM API key not configured',
			},
			500
		);
	}

	const amountNum = Number(amount);
	if (!link || !amountNum || amountNum <= 0) {
		return json(
			{
				success: false,
				error: 'Invalid amount or link',
			},
			400
		);
	}

	let linkType = 'unknown';
	let isInstagram = false;
	let quantity = 0;
	let serviceId = null;
	let orderStatus = 'failed';
	let orderId = null;

	// =============================
	// ✅ INSTAGRAM LINK VALIDATION
	// =============================
	if (/^https?:\/\/(www\.)?instagram\.com\//i.test(link)) {
		isInstagram = true;

		if (/instagram\.com\/reel\/[A-Za-z0-9._-]+/i.test(link)) {
			linkType = 'reel';
		} else if (
			/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?(\?.*)?$/i.test(link)
		) {
			linkType = 'profile';
		}
	}

	// =============================
	// ✅ SERVICE & QUANTITY LOGIC
	// =============================

	// PROFILE PACKAGES
	if (linkType === 'profile') {
		serviceId = 850;
		const profileMap = {
			15: 100, // ₹15 => 100 followers
			8: 50, // ₹8  => 50 followers
			1: 10,
		};
		quantity = profileMap[amountNum] || 0;
	}

	// REEL PACKAGES
	if (linkType === 'reel') {
		serviceId = 861;
		const reelMap = {
			7: 5000,
			12: 10000,
			25: 25000,
			35: 50000,
		};
		quantity = reelMap[amountNum] || 0;
	}

	// =============================
	// ✅ API CALL
	// =============================
	if (isInstagram && quantity > 0 && serviceId) {
		const baseUrl = env.AIRGROWSMM_API_URL;
		if (!baseUrl) {
			return json(
				{
					success: false,
					error: 'SMM API base URL not configured',
				},
				500
			);
		}

		const apiUrl = `${baseUrl}?key=${apiKey}&action=add&service=${serviceId}&link=${encodeURIComponent(
			link
		)}&quantity=${quantity}`;

		try {
			const res = await fetch(apiUrl);
			const apiResponse = await res.json();

			if (apiResponse && apiResponse.order) {
				orderStatus = 'success';
				orderId = apiResponse.order;
			}
		} catch (err) {
			// swallow, keep failed status
			console.log('SMM API ERROR >>>', err?.message || String(err));
		}
	}

	return json({
		success: orderStatus === 'success',
		order: orderStatus,
		orderId,
		linkType,
		quantity,
		amount: amountNum,
	});
}

// Get SMM panel balance using same API key
export async function getSmmBalance(env) {
	const apiKey = env.AIRGROWSMM_API_KEY;
	if (!apiKey) {
		return json({ success: false, error: 'SMM API key not configured' }, 500);
	}

	try {
		const baseUrl = env.AIRGROWSMM_API_URL;
		if (!baseUrl) {
			return json(
				{ success: false, error: 'SMM API base URL not configured' },
				500
			);
		}

		const apiUrl = `${baseUrl}?key=${apiKey}&action=balance`;
		const apiResponse = await fetch(apiUrl);
		const data = await apiResponse.json();

		return json({
			...data,
			currency: 'INR',
			panel: 'air grow smm',
		});
	} catch (err) {
		return json(
			{
				success: false,
				error: err?.message || String(err),
			},
			500
		);
	}
}

