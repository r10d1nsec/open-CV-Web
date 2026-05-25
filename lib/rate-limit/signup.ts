/**
 * Rate limit del signup — protege /signup contra abuso (alta masiva de cuentas
 * o enumeración). Por IP, ventana de 1 hora.
 *
 * Refs: spec:015 (launch-readiness).
 */
import { checkRateLimit, type RateLimitResult } from './core';

export const SIGNUP_LIMIT = 5;
export const SIGNUP_WINDOW_SEC = 3600; // 1 hora

export function signupRateLimitKey(ipHash: string): string {
  return `signup:${ipHash}`;
}

export async function checkSignupRateLimit(ipHash: string): Promise<RateLimitResult> {
  return checkRateLimit(signupRateLimitKey(ipHash), {
    limit: SIGNUP_LIMIT,
    windowSec: SIGNUP_WINDOW_SEC,
  });
}
