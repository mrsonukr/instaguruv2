import { json } from '../utils';
import servicesData from '../services.js';

// Shared Instagram SMM processing logic (supports multiple APIs)
// Used by: /neworder + /instagram endpoint
export async function processInstagramOrder(env, amount, link) {
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
	let selectedApi = null;

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
	// ✅ SERVICE & QUANTITY LOGIC (from services.json)
	// =============================
	if (isInstagram && linkType !== 'unknown') {
		const service = servicesData.find(
			(s) => s.linkType === linkType && s.price === amountNum
		);

		if (service) {
			serviceId = service.serviceId;
			quantity = service.quantity;
			selectedApi = service.api;
		}
	}

	// =============================
	// ✅ API CALL
	// =============================
	if (isInstagram && quantity > 0 && serviceId && selectedApi) {
		let apiKey, baseUrl;

		if (selectedApi === 'airgrow') {
			apiKey = env.AIRGROWSMM_API_KEY;
			baseUrl = env.AIRGROWSMM_API_URL;
		} else if (selectedApi === 'supportivesmm') {
			apiKey = env.SUPPORTIVESMM_API_KEY;
			baseUrl = env.SUPPORTIVESMM_API_URL;
		} else if (selectedApi === 'tntsmm') {
			apiKey = env.TNTSMM_API_KEY;
			baseUrl = env.TNTSMM_API_URL;
		} else if (selectedApi === 'sakbasmm') {
			apiKey = env.SAKBASMM_API_KEY;
			baseUrl = env.SAKBASMM_API_URL;
		}

		if (!apiKey || !baseUrl) {
			return json(
				{
					success: false,
					error: `${selectedApi} API not configured`,
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
			console.log(`SMM API ERROR (${selectedApi}) >>>`, err?.message || String(err));
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

// Get SMM panel balance using API key (supports multiple APIs)
export async function getSmmBalance(env, api = 'airgrow') {
	let apiKey, baseUrl, panelName;

	if (api === 'airgrow') {
		apiKey = env.AIRGROWSMM_API_KEY;
		baseUrl = env.AIRGROWSMM_API_URL;
		panelName = 'air grow smm';
	} else if (api === 'supportivesmm') {
		apiKey = env.SUPPORTIVESMM_API_KEY;
		baseUrl = env.SUPPORTIVESMM_API_URL;
		panelName = 'supportive smm';
	} else if (api === 'tntsmm') {
		apiKey = env.TNTSMM_API_KEY;
		baseUrl = env.TNTSMM_API_URL;
		panelName = 'tnt smm';
	} else if (api === 'sakbasmm') {
		apiKey = env.SAKBASMM_API_KEY;
		baseUrl = env.SAKBASMM_API_URL;
		panelName = 'sabka smm';
	}

	if (!apiKey) {
		return json({ success: false, error: `${panelName} API key not configured` }, 500);
	}

	try {
		if (!baseUrl) {
			return json(
				{ success: false, error: `${panelName} API base URL not configured` },
				500
			);
		}

		const apiUrl = `${baseUrl}?key=${apiKey}&action=balance`;
		const apiResponse = await fetch(apiUrl);
		const data = await apiResponse.json();

		return json({
			...data,
			currency: 'INR',
			panel: panelName,
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

