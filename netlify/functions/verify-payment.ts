// Netlify Function: vérification d'un paiement GeniusPay par référence.
// Usage: GET /api/payment/verify?reference=MTX-XXXX

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'GET') {
    return json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }, 405);
  }

  const apiKey = process.env.GENIUS_PAY_API_KEY;
  const apiSecret = process.env.GENIUS_PAY_API_SECRET;
  const baseUrl = process.env.GENIUS_PAY_BASE_URL || 'https://pay.genius.ci/api/v1/merchant';

  if (!apiKey || !apiSecret) {
    return json({ success: false, error: { code: 'CONFIG_MISSING', message: 'GeniusPay credentials are not configured on the server' } }, 500);
  }

  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');

  if (!reference || !/^MTX-[A-Z0-9]+$/i.test(reference)) {
    return json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid reference is required' } }, 422);
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
    });
  } catch (err) {
    return json({
      success: false,
      error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error' },
    }, 502);
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

export const config = { path: '/api/payment/verify' };
