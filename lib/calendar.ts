/**
 * Lightweight calendar utilities. No external deps.
 * All dates handled in UTC for determinism; the host will localize for display.
 */

export type IsoDate = string; // YYYY-MM-DD
export type HHMM = string; // HH:MM (24h)

export type DayCell = {
  date: Date;
  /** YYYY-MM-DD */
  iso: IsoDate;
  /** day-of-month (1-31) */
  day: number;
  /** belongs to the focused month */
  inMonth: boolean;
  /** Saturday or Sunday */
  isWeekend: boolean;
};

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES_EN[month] ?? ''} ${year}`;
}

export function isoFor(date: Date): IsoDate {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1));
}

/**
 * Build a 6×7 = 42-cell grid for a month, padded with neighbor month days.
 * Week starts on Monday.
 */
export function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  // JS getUTCDay(): 0=Sun..6=Sat → convert to Mon-first: 0=Mon..6=Sun
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(1 - firstWeekday);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + i);
    const day = date.getUTCDate();
    const inMonth = date.getUTCMonth() === month;
    const weekday = date.getUTCDay();
    cells.push({
      date,
      iso: isoFor(date),
      day,
      inMonth,
      isWeekend: weekday === 0 || weekday === 6,
    });
  }
  return cells;
}

/**
 * Deterministic mock availability for Sprint 2.
 * Available iff: in the focused month AND not in the past AND not a weekend
 * AND day matches a small "open" set (every 1-2 days, skip some).
 * Sprint 7 replaces this with real Google Calendar free/busy lookup.
 */
export function mockAvailability(year: number, month: number, today: Date): Set<IsoDate> {
  const grid = buildMonthGrid(year, month);
  const todayMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const available = new Set<IsoDate>();
  for (const cell of grid) {
    if (!cell.inMonth) continue;
    if (cell.isWeekend) continue;
    const cellMs = Date.UTC(
      cell.date.getUTCFullYear(),
      cell.date.getUTCMonth(),
      cell.date.getUTCDate(),
    );
    if (cellMs < todayMs) continue;
    // Pattern: skip every 3rd weekday for variety
    if (cell.day % 7 === 5) continue;
    available.add(cell.iso);
  }
  return available;
}

/**
 * Generate display time slots for a given day and duration.
 * Sprint 2 returns a fixed grid 09:30 → 17:30 with 30min cadence,
 * filtered so that slot + duration fits inside business hours.
 */
export function generateTimeSlots(_date: IsoDate, durationMin: number): HHMM[] {
  const startMin = 9 * 60 + 30; // 09:30
  const endMin = 17 * 60 + 30; // 17:30
  const step = 30;
  const out: HHMM[] = [];
  for (let m = startMin; m + durationMin <= endMin; m += step) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return out;
}

export function formatHumanDate(iso: IsoDate): string {
  const date = parseIso(iso);
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    date.getUTCDay()
  ];
  const month = MONTH_NAMES_EN[date.getUTCMonth()];
  return `${weekday}, ${date.getUTCDate()} ${month}`;
}
