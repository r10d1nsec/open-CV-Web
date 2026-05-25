/**
 * Contact form validator — Sprint 6 S6.2.
 *
 * Schema tolerante a FormData: strings raw del form son trimeados, email
 * pasa a minúsculas, honeypot ausente coerce a `''`.
 *
 * El check del honeypot (`honeypot !== ''`) lo hace la action — aquí solo
 * se valida la forma del campo.
 *
 * Refs: spec:012 §Non-functional, spec:002 §Validation.
 */
import { z } from 'zod';

const trimmed = (max: number, min = 1, msg?: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(min, msg).max(max));

export const ContactSchema = z.object({
  name: trimmed(80, 2, 'Mínimo 2 caracteres.'),
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().email('Email no válido.').max(120)),
  message: trimmed(2000, 10, 'Mensaje muy corto (mínimo 10 caracteres).'),
  // Honeypot: campo oculto que solo bots rellenan. Defaults a '' si ausente.
  honeypot: z.preprocess(
    (v) => (typeof v === 'string' ? v : ''),
    z.string().max(120),
  ),
});

export type ContactInput = z.infer<typeof ContactSchema>;
