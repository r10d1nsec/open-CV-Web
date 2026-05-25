/**
 * Shared zod schemas for auth flows. Server-side validation only — the
 * forms in `app/(auth)/*` send `FormData` to Server Actions which parse it
 * with these schemas. Client-side hints (HTML5 `required`, `minlength`) are
 * a UX nicety, never the source of truth.
 *
 * Error messages are in Spanish (project default for 3a; i18n is Sprint 11).
 *
 * Refs: spec:001 §Requirements, §Acceptance AC6
 */
import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Introduce tu email')
  .email('Email no válido');

const passwordMinLength = 8;
const strongPasswordSchema = z
  .string()
  .min(passwordMinLength, `La contraseña debe tener al menos ${passwordMinLength} caracteres`);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Introduce tu contraseña'),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Server Action result shape. Actions either:
 *   - return `{ ok: true }` (form stays mounted, used by forgot-password)
 *   - return `{ ok: false, error, field? }` (form re-renders with errors)
 *   - throw NEXT_REDIRECT (success path that navigates away)
 *
 * The `field` discriminator lets the form highlight a single input when
 * the error is field-specific (e.g. "Email ya registrado" on signup).
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: 'email' | 'password' | 'confirmPassword' | 'form' };

export function formError(error: string, field?: ActionResult extends { ok: false; field?: infer F } ? F : never): ActionResult {
  return { ok: false, error, field };
}
