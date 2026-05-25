/**
 * Generación de slots de reserva — lógica pura, single-timezone (Europe/Madrid).
 *
 * Las fechas son cadenas `YYYY-MM-DD` (calendario, sin hora) y los minutos son
 * desde medianoche en hora local de España. Esto evita por completo la
 * aritmética de DST: el dominio es "fecha + minuto local", y la UI muestra todo
 * como hora de España (se indica en la página).
 *
 * Refs: spec:007 (booking re-scoped), migración 0008.
 */

export type AvailabilityRule = { weekday: number; startMin: number; endMin: number };
export type BlockingBooking = { date: string; startMin: number; durationMinutes: number };
export type Slot = { date: string; startMin: number };

/** weekday 0=Lunes … 6=Domingo desde una fecha YYYY-MM-DD (parse UTC, sin shift). */
export function weekdayOf(dateISO: string): number {
  const d = new Date(`${dateISO}T00:00:00Z`);
  return (d.getUTCDay() + 6) % 7; // getUTCDay: 0=domingo → mapeo a 0=lunes
}

/** Suma `n` días a una fecha YYYY-MM-DD y devuelve YYYY-MM-DD. */
export function addDays(dateISO: string, n: number): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function generateSlots(params: {
  rules: readonly AvailabilityRule[];
  booked: readonly BlockingBooking[];
  durationMinutes: number;
  startDate: string;
  days: number;
  stepMin?: number;
  /** Si se pasa, descarta slots que empiezan antes de `now` (mismo día). */
  now?: { date: string; min: number };
}): Slot[] {
  const { rules, booked, durationMinutes, startDate, days } = params;
  const step = params.stepMin && params.stepMin > 0 ? params.stepMin : durationMinutes;
  if (durationMinutes <= 0 || days <= 0) return [];

  const slots: Slot[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const wd = weekdayOf(date);
    const dayRules = rules.filter((r) => r.weekday === wd);
    if (dayRules.length === 0) continue;

    const dayBooked = booked.filter((b) => b.date === date);

    for (const rule of dayRules) {
      for (let start = rule.startMin; start + durationMinutes <= rule.endMin; start += step) {
        const end = start + durationMinutes;
        if (params.now && date === params.now.date && start < params.now.min) continue;
        const clash = dayBooked.some((b) => overlaps(start, end, b.startMin, b.startMin + b.durationMinutes));
        if (clash) continue;
        slots.push({ date, startMin: start });
      }
    }
  }
  // Orden estable por fecha y hora.
  slots.sort((a, b) => (a.date === b.date ? a.startMin - b.startMin : a.date < b.date ? -1 : 1));
  return slots;
}

/** "9:00", "14:30" desde minutos. */
export function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

/** "9:00" / "09:30" → minutos. Devuelve null si inválido. */
export function parseMin(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
