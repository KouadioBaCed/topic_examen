// Netlify Function: création d'un paiement GeniusPay côté serveur.
// La clé X-API-Secret est lue depuis les variables d'environnement Netlify.

interface CreatePaymentBody {
  courseSlug: string;
  courseName: string;
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  origin?: string;
  paymentMethod?: 'wave' | 'orange_money' | 'mtn_money' | 'moov_money' | 'card' | 'checkout';
}

const COURSE_PRICE = 200000;
const ALLOWED_METHODS = ['wave', 'orange_money', 'mtn_money', 'moov_money', 'card'] as const;

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }, 405);
  }

  const apiKey = process.env.GENIUS_PAY_API_KEY;
  const apiSecret = process.env.GENIUS_PAY_API_SECRET;
  const baseUrl = process.env.GENIUS_PAY_BASE_URL || 'https://pay.genius.ci/api/v1/merchant';

  if (!apiKey || !apiSecret) {
    return json({ success: false, error: { code: 'CONFIG_MISSING', message: 'GeniusPay credentials are not configured on the server' } }, 500);
  }

  let body: CreatePaymentBody;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } }, 400);
  }

  if (!body.courseSlug || !body.uid) {
    return json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'courseSlug and uid are required' } }, 422);
  }

  const origin = body.origin || req.headers.get('origin') || process.env.GENIUS_PAY_PUBLIC_URL || '';
  const success_url = origin ? `${origin}/payment/success?course=${encodeURIComponent(body.courseSlug)}` : undefined;
  const error_url = origin ? `${origin}/payment/error?course=${encodeURIComponent(body.courseSlug)}` : undefined;

  const payload: Record<string, unknown> = {
    amount: COURSE_PRICE,
    currency: 'XOF',
    description: `Abonnement 1 mois — ${body.courseName || body.courseSlug}`,
    customer: {
      name: body.displayName,
      email: body.email,
      phone: body.phone,
    },
    success_url,
    error_url,
    metadata: {
      uid: body.uid,
      course_slug: body.courseSlug,
      plan: 'monthly',
    },
  };

  // Si l'utilisateur a choisi un moyen précis, on le force; sinon on laisse GeniusPay afficher la page checkout.
  if (body.paymentMethod && body.paymentMethod !== 'checkout' && (ALLOWED_METHODS as readonly string[]).includes(body.paymentMethod)) {
    payload.payment_method = body.paymentMethod;
  }

  try {
    const upstream = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data?.success) {
      return json(
        {
          success: false,
          error: data?.error || { code: 'PAYMENT_INIT_FAILED', message: 'Unable to initiate payment' },
        },
        upstream.status || 502,
      );
    }

    return json({
      success: true,
      data: {
        reference: data.data.reference,
        amount: data.data.amount,
        currency: data.data.currency || 'XOF',
        status: data.data.status,
        checkout_url: data.data.checkout_url || data.data.payment_url,
        payment_url: data.data.payment_url || data.data.checkout_url,
        expires_at: data.data.expires_at,
      },
    }, 200);
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export const config = { path: '/api/payment/create' };
