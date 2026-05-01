import type { CertificationSlug, CourseSubscription, AppUser } from '../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// TEST PRODUCTION — montant abaissé temporairement au minimum GeniusPay (200 XOF).
// Remettre à 200000 une fois les tests validés. Doit rester aligné avec
// COURSE_PRICE dans netlify/functions/create-payment.ts.
export const COURSE_PRICE_XOF = 200;
export const SUBSCRIPTION_DURATION_DAYS = 30;

export interface CreatePaymentParams {
  courseSlug: CertificationSlug;
  courseName: string;
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
}

export interface CreatePaymentResponse {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  checkout_url?: string;
  payment_url?: string;
  expires_at?: string;
}

export interface VerifyPaymentResponse {
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired' | string;
  payment_method?: string | null;
  metadata: Record<string, string>;
  completed_at?: string | null;
  created_at?: string;
}

interface ApiError {
  code: string;
  message: string;
}

export class PaymentApiError extends Error {
  code: string;
  status: number;
  constructor(error: ApiError, status: number) {
    super(error.message);
    this.code = error.code;
    this.status = status;
  }
}

// Domaines autorisés pour la redirection post-création (anti open-redirect).
// Toute autre origine retournée par l'API sera rejetée côté client.
const ALLOWED_REDIRECT_HOSTS = [
  'pay.genius.ci',
  'genius.ci',
  'wave.com',
  'pay.wave.com',
  'paystack.com',
  'checkout.paystack.com',
];

export function isSafeRedirectUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    return ALLOWED_REDIRECT_HOSTS.some(host => u.hostname === host || u.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export async function createCoursePayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
  let res: Response;
  try {
    res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `same-origin` est le défaut, mais on l'explicite : la fonction pose un
      // cookie `gpRef` que verify-payment relira ensuite.
      credentials: 'same-origin',
      body: JSON.stringify({
        ...params,
        origin: window.location.origin,
      }),
    });
  } catch (e) {
    throw new PaymentApiError(
      { code: 'NETWORK_ERROR', message: 'Impossible de contacter le serveur de paiement (vérifiez votre connexion).' },
      0,
    );
  }

  if (res.status === 404) {
    throw new PaymentApiError(
      { code: 'FUNCTION_NOT_DEPLOYED', message: "Le service de paiement n'est pas déployé. (Netlify Functions absentes du build)" },
      404,
    );
  }

  const text = await res.text();
  let data: { success?: boolean; data?: CreatePaymentResponse; error?: ApiError } | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new PaymentApiError(
      { code: 'BAD_RESPONSE', message: `Réponse invalide du serveur (HTTP ${res.status}).` },
      res.status,
    );
  }

  if (!res.ok || !data?.success) {
    const err: ApiError = data?.error || { code: 'UNKNOWN', message: `Erreur HTTP ${res.status}` };
    throw new PaymentApiError(err, res.status);
  }
  return data.data as CreatePaymentResponse;
}

export async function verifyCoursePayment(reference: string): Promise<VerifyPaymentResponse> {
  const res = await fetch(`/api/payment/verify?reference=${encodeURIComponent(reference)}`, {
    // Indispensable pour que le cookie `gpRef` posé par create-payment soit envoyé
    // à verify-payment, qui s'en sert comme ref marchand de fallback.
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    const err: ApiError = data?.error || { code: 'UNKNOWN', message: 'Erreur inconnue' };
    throw new PaymentApiError(err, res.status);
  }
  return data.data as VerifyPaymentResponse;
}

export async function grantCourseAccessAfterPayment(
  uid: string,
  courseSlug: CertificationSlug,
  payment: VerifyPaymentResponse,
): Promise<AppUser> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('Utilisateur introuvable');
  }
  const user = snap.data() as AppUser;

  // Idempotency: if a subscription with this reference already exists, return the user as-is.
  const alreadyApplied = (user.courseSubscriptions || []).some(s => s.reference === payment.reference);
  if (alreadyApplied) {
    return user;
  }

  const now = new Date();
  const existingSub = (user.courseSubscriptions || []).find(s => s.courseSlug === courseSlug);
  const baseDate = existingSub && new Date(existingSub.expiresAt) > now ? new Date(existingSub.expiresAt) : now;
  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + SUBSCRIPTION_DURATION_DAYS);

  const subscription: CourseSubscription = {
    courseSlug,
    reference: payment.reference,
    amount: payment.amount,
    currency: payment.currency || 'XOF',
    paidAt: payment.completed_at || new Date().toISOString(),
    expiresAt: newExpiry.toISOString(),
    paymentMethod: payment.payment_method ?? null,
  };

  const otherSubs = (user.courseSubscriptions || []).filter(s => s.courseSlug !== courseSlug);
  const courseSubscriptions = [...otherSubs, subscription];

  const allowedCourses = Array.from(new Set([...(user.allowedCourses || []), courseSlug]));

  const userExpiresAt = new Date(user.expiresAt || 0);
  const updates: Record<string, unknown> = {
    courseSubscriptions,
    allowedCourses,
    isActive: true,
  };
  if (newExpiry > userExpiresAt) {
    updates.expiresAt = newExpiry.toISOString();
  }

  await updateDoc(userRef, updates);

  return {
    ...user,
    ...updates,
    courseSubscriptions,
    allowedCourses,
  } as AppUser;
}

export function getActiveSubscription(user: AppUser | null, slug: CertificationSlug): CourseSubscription | null {
  if (!user?.courseSubscriptions) return null;
  const sub = user.courseSubscriptions.find(s => s.courseSlug === slug);
  if (!sub) return null;
  return new Date(sub.expiresAt) > new Date() ? sub : null;
}

export function formatPriceXof(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}
