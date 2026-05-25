import { describe, expect, it } from 'vitest';
import {
  buildMonthGrid,
  formatHumanDate,
  generateTimeSlots,
  isoFor,
  mockAvailability,
  monthLabel,
  parseIso,
} from '@/lib/calendar';

describe('buildMonthGrid', () => {
  it('returns 42 cells (6 weeks × 7 days)', () => {
    const grid = buildMonthGrid(2026, 8); // September 2026
    expect(grid).toHaveLength(42);
  });

  it('first cell starts on a Monday', () => {
    const grid = buildMonthGrid(2026, 8);
    const firstDate = grid[0]!.date;
    // Monday = 1 in JS getUTCDay()
    expect(firstDate.getUTCDay()).toBe(1);
  });

  it('marks cells outside the focused month with inMonth=false', () => {
    const grid = buildMonthGrid(2026, 8);
    expect(grid[0]!.inMonth).toBe(false); // late August
    const september = grid.filter((c) => c.inMonth);
    expect(september.length).toBe(30); // September has 30 days
  });

  it('handles February in a leap year (Feb 2028)', () => {
    const grid = buildMonthGrid(2028, 1);
    const feb = grid.filter((c) => c.inMonth);
    expect(feb.length).toBe(29);
  });

  it('handles February in a non-leap year (Feb 2027)', () => {
    const grid = buildMonthGrid(2027, 1);
    const feb = grid.filter((c) => c.inMonth);
    expect(feb.length).toBe(28);
  });

  it('isoFor returns YYYY-MM-DD format', () => {
    const grid = buildMonthGrid(2026, 8);
    const first = grid.find((c) => c.inMonth && c.day === 1)!;
    expect(first.iso).toBe('2026-09-01');
  });

  it('marks weekends correctly', () => {
    const grid = buildMonthGrid(2026, 8);
    const sep5 = grid.find((c) => c.iso === '2026-09-05')!; // Saturday
    const sep7 = grid.find((c) => c.iso === '2026-09-07')!; // Monday
    expect(sep5.isWeekend).toBe(true);
    expect(sep7.isWeekend).toBe(false);
  });
});

describe('mockAvailability', () => {
  it('excludes past days', () => {
    const today = new Date(Date.UTC(2026, 8, 15));
    const avail = mockAvailability(2026, 8, today);
    expect(avail.has('2026-09-01')).toBe(false);
    expect(avail.has('2026-09-14')).toBe(false);
  });

  it('excludes weekends', () => {
    const today = new Date(Date.UTC(2026, 8, 1));
    const avail = mockAvailability(2026, 8, today);
    expect(avail.has('2026-09-05')).toBe(false); // Saturday
    expect(avail.has('2026-09-06')).toBe(false); // Sunday
  });

  it('includes some weekdays', () => {
    const today = new Date(Date.UTC(2026, 8, 1));
    const avail = mockAvailability(2026, 8, today);
    expect(avail.size).toBeGreaterThan(5);
  });
});

describe('generateTimeSlots', () => {
  it('returns 30-min cadence from 09:30 to fit duration', () => {
    const slots = generateTimeSlots('2026-09-17', 60);
    expect(slots[0]).toBe('09:30');
    expect(slots).toContain('13:00');
    expect(slots.every((s) => /^\d{2}:\d{2}$/.test(s))).toBe(true);
  });

  it('shorter duration yields more slots', () => {
    const sixty = generateTimeSlots('2026-09-17', 60);
    const thirty = generateTimeSlots('2026-09-17', 30);
    expect(thirty.length).toBeGreaterThanOrEqual(sixty.length);
  });

  it('no slot extends beyond 17:30', () => {
    const slots = generateTimeSlots('2026-09-17', 60);
    const last = slots[slots.length - 1]!;
    const [h, m] = last.split(':').map(Number);
    expect((h ?? 0) * 60 + (m ?? 0) + 60).toBeLessThanOrEqual(17 * 60 + 30);
  });
});

describe('helpers', () => {
  it('monthLabel formats in English', () => {
    expect(monthLabel(2026, 8)).toBe('September 2026');
    expect(monthLabel(2026, 0)).toBe('January 2026');
  });
  it('parseIso roundtrips with isoFor', () => {
    const date = parseIso('2026-09-17');
    expect(isoFor(date)).toBe('2026-09-17');
  });
  it('formatHumanDate returns weekday + day + month', () => {
    expect(formatHumanDate('2026-09-17')).toBe('Thursday, 17 September');
  });
});
