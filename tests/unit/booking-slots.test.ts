/**
 * Tests de la generación pura de slots de reserva (spec:007 re-scoped).
 */
import { describe, expect, it } from 'vitest';
import {
  generateSlots,
  weekdayOf,
  addDays,
  formatMin,
  parseMin,
} from '@/lib/booking/slots';

// 2026-05-25 es lunes.
describe('weekdayOf', () => {
  it('mapea 0=lunes … 6=domingo', () => {
    expect(weekdayOf('2026-05-25')).toBe(0); // lunes
    expect(weekdayOf('2026-05-26')).toBe(1); // martes
    expect(weekdayOf('2026-05-31')).toBe(6); // domingo
  });
});

describe('addDays', () => {
  it('suma días cruzando fin de mes', () => {
    expect(addDays('2026-05-31', 1)).toBe('2026-06-01');
    expect(addDays('2026-05-25', 7)).toBe('2026-06-01');
  });
});

describe('generateSlots', () => {
  const rules = [
    { weekday: 0, startMin: 9 * 60, endMin: 11 * 60 }, // lunes 9:00-11:00
  ];

  it('genera slots por duración dentro de la franja', () => {
    const slots = generateSlots({ rules, booked: [], durationMinutes: 60, startDate: '2026-05-25', days: 1 });
    expect(slots).toEqual([
      { date: '2026-05-25', startMin: 540 },
      { date: '2026-05-25', startMin: 600 },
    ]);
  });

  it('no genera nada en días sin reglas', () => {
    const slots = generateSlots({ rules, booked: [], durationMinutes: 60, startDate: '2026-05-26', days: 1 });
    expect(slots).toEqual([]);
  });

  it('excluye slots que solapan reservas existentes', () => {
    const booked = [{ date: '2026-05-25', startMin: 540, durationMinutes: 60 }];
    const slots = generateSlots({ rules, booked, durationMinutes: 60, startDate: '2026-05-25', days: 1 });
    expect(slots).toEqual([{ date: '2026-05-25', startMin: 600 }]);
  });

  it('respeta el step cuando se indica', () => {
    const slots = generateSlots({ rules, booked: [], durationMinutes: 30, startDate: '2026-05-25', days: 1, stepMin: 60 });
    expect(slots.map((s) => s.startMin)).toEqual([540, 600]);
  });

  it('descarta slots pasados con now', () => {
    const slots = generateSlots({
      rules, booked: [], durationMinutes: 60, startDate: '2026-05-25', days: 1,
      now: { date: '2026-05-25', min: 570 },
    });
    expect(slots).toEqual([{ date: '2026-05-25', startMin: 600 }]);
  });

  it('cubre varios días y ordena', () => {
    const weekly = [
      { weekday: 0, startMin: 600, endMin: 660 }, // lunes 10-11
      { weekday: 1, startMin: 540, endMin: 600 }, // martes 9-10
    ];
    const slots = generateSlots({ rules: weekly, booked: [], durationMinutes: 60, startDate: '2026-05-25', days: 2 });
    expect(slots).toEqual([
      { date: '2026-05-25', startMin: 600 },
      { date: '2026-05-26', startMin: 540 },
    ]);
  });

  it('devuelve vacío con duración o días no válidos', () => {
    expect(generateSlots({ rules, booked: [], durationMinutes: 0, startDate: '2026-05-25', days: 1 })).toEqual([]);
    expect(generateSlots({ rules, booked: [], durationMinutes: 60, startDate: '2026-05-25', days: 0 })).toEqual([]);
  });
});

describe('formatMin / parseMin', () => {
  it('formatea minutos a H:MM', () => {
    expect(formatMin(540)).toBe('9:00');
    expect(formatMin(570)).toBe('9:30');
    expect(formatMin(0)).toBe('0:00');
  });

  it('parsea H:MM a minutos y rechaza inválidos', () => {
    expect(parseMin('9:00')).toBe(540);
    expect(parseMin('14:30')).toBe(870);
    expect(parseMin('25:00')).toBeNull();
    expect(parseMin('9:99')).toBeNull();
    expect(parseMin('nope')).toBeNull();
  });
});
