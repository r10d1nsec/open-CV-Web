/**
 * Derive 2-letter initials from a full name.
 *
 * Refs: spec:011 (onboarding step 2 — auto-fill profiles.initials), spec:002.
 */
export function calculateInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
