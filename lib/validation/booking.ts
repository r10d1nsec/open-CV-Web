/**
 * Validación de booking (spec:007 re-scoped).
 *  - AvailabilitySchema: franjas semanales (weekday + start/end en minutos).
 *  - BookingSchema: una reserva pública (slot + datos del visitante + honeypot).
 *
 * Refs: lib/booking/slots.ts, migración 0008.
 */
import { z } from 'zod';

const minute = z.coerce.number().int().min(0).max(1440);

export const AvailabilityRuleSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    startMin: minute,
    endMin: minute,
  })
  .refine((r) => r.endMin > r.startMin, { message: 'El fin debe ser posterior al inicio', path: ['endMin'] });

export const AvailabilitySchema = z.object({
  rules: z.array(AvailabilityRuleSchema).max(40),
});

export type AvailabilityInput = z.infer<typeof AvailabilitySchema>;

const trimmed = (max: number) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(max));

export const BookingSchema = z.object({
  serviceExternalId: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined),
    z.string().max(40).optional(),
  ),
  serviceName: z.string().max(80).optional().transform((s) => (s ?? '').slice(0, 80)),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  startMin: minute,
  durationMinutes: z.coerce.number().int().min(5).max(1440),
  name: trimmed(80),
  email: z.string().email('Email inválido').max(120),
  message: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().max(500),
  ),
});

export type BookingInput = z.infer<typeof BookingSchema>;
