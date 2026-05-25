import type { Service } from '@/types/profile';

/** Human-readable duration. Accepts number (minutes) or string code like "5d". */
export function formatDuration(duration: Service['duration']): string {
  if (typeof duration === 'number') return `${duration} min`;
  // string code: e.g. "5d" → "5 days", "2h" → "2 hours"
  const match = /^(\d+)([dh])$/.exec(duration);
  if (match) {
    const n = Number(match[1]);
    return match[2] === 'd' ? `${n} day${n === 1 ? '' : 's'}` : `${n} hour${n === 1 ? '' : 's'}`;
  }
  return duration;
}
