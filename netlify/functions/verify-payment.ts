// Netlify Function: vérification d'un paiement GeniusPay par référence.
// Usage: GET /api/payment/verify?reference=MTX-XXXX

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin: string | null) {
  const allow = isAllowedOrigin(origin) ? origin! : (ALLOWED_ORIGINS[0] || '*');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'GET') {
    return json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }, 405, origin);
  }

  if (origin && !isAllowedOrigin(origin)) {
    return json({ success: false, error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin not allowed' } }, 403, origin);
  }

  const apiKey = process.env.GENIUS_PAY_API_KEY;
  const apiSecret = process.env.GENIUS_PAY_API_SECRET;
  const baseUrl = process.env.GENIUS_PAY_BASE_URL || 'https://pay.genius.ci/api/v1/merchant';

  if (!apiKey || !apiSecret) {
    return json({ success: false, error: { code: 'CONFIG_MISSING', message: 'GeniusPay credentials are not configured on the server' } }, 500, origin);
  }

  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');

  if (!reference || !/^MTX-[A-Z0-9]{4,40}$/i.test(reference)) {
    return json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid reference is required' } }, 422, origin);
  }

  try {
    const upstream = await fetch(`${baseUrl}/payments/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        Accept: 'application/json',
      },
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data?.success) {
      return json(
        {
          success: false,
          error: data?.error || { code: 'TRANSACTION_NOT_FOUND', message: 'Transaction not found' },
        },
        upstream.status || 404,
        origin,
      );
    }

    const tx = data.data;
    return json({
      success: true,
      data: {
        reference: tx.reference,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        payment_method: tx.payment_method,
        metadata: tx.metadata || {},
        completed_at: tx.completed_at,
        created_at: tx.created_at,
      },
    }, 200, origin);
  } catch (err) {
    return json({
      success: false,
      error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error' },
    }, 502, origin);
  }
};
