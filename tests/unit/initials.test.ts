/**
 * Tests for the initials helper (Sprint 5 onboarding step 2).
 *
 * Refs: lib/profile/initials.ts, spec:011 S5.3.
 */
import { describe, expect, it } from 'vitest';
import { calculateInitials } from '@/lib/profile/initials';

describe('calculateInitials', () => {
  it('uses first letter of first two words', () => {
    expect(calculateInitials('Maya Okafor')).toBe('MO');
    expect(calculateInitials('maria garcia')).toBe('MG');
    expect(calculateInitials('Jean-Pierre Dupont')).toBe('JD');
  });

  it('with a single word, uses first two letters', () => {
    expect(calculateInitials('Cher')).toBe('CH');
    expect(calculateInitials('A')).toBe('A');
  });

  it('handles extra whitespace + empty input', () => {
    expect(calculateInitials('  Maya   Okafor  ')).toBe('MO');
    expect(calculateInitials('')).toBe('');
    expect(calculateInitials('   ')).toBe('');
  });

  it('ignores middle words past the second', () => {
    expect(calculateInitials('Maya Lucía Okafor')).toBe('ML');
  });
});
