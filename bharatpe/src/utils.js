// Common utilities: CORS + JSON helpers

export function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': '*',
	};
}

export function addCors(res) {
	const headers = new Headers(res.headers);
	headers.set('Access-Control-Allow-Origin', '*');
	headers.set('Access-Control-Allow-Headers', '*');
	headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	return new Response(res.body, { status: res.status, headers });
}

export function json(obj, status = 200) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders(),
		},
	});
}


