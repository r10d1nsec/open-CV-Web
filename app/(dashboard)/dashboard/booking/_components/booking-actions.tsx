'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  setBookingStatus,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/booking/_actions/booking-admin';

export function BookingActions({ id }: { id: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => setBookingStatus(prev ?? { ok: true }, fd),
    null,
  );
  return (
    <form action={formAction} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" name="status" value="confirmed" variant="primary" size="sm">Confirmar</Button>
      <Button type="submit" name="status" value="rejected" variant="ghost" size="sm" style={{ color: 'var(--danger)' }}>Rechazar</Button>
      {state && !state.ok && <span role="alert" style={{ fontSize: 12, color: 'var(--danger)' }}>{state.error}</span>}
    </form>
  );
}
