/**
 * Profile store dispatcher.
 *
 * Server-only. Routes profile lookups to the Supabase driver when credentials
 * are present, falling back to the in-memory Maya mock when they are not
 * (keeps `pnpm dev` and tests usable without `.env.local`).
 *
 * Refs: spec:002 §Implementation (Sub-sprint 3c), spec:008 routing (Sprint 4).
 */
import { mockMaya } from '@/data/mock-maya';
import { getCurrentUser } from '@/lib/auth';
import { hasSupabaseEnv } from '@/lib/env';
import {
  getProfileFromSupabase,
  getProfileFromSupabaseByUserId,
} from '@/lib/profile-store/supabase-driver';
import type { Profile } from '@/types/profile';

const MOCK_USER_ID = 'mock-maya-user-id';

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return username === 'maya' ? mockMaya : null;
  }
  return getProfileFromSupabase(username);
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return userId === MOCK_USER_ID ? mockMaya : null;
  }
  return getProfileFromSupabaseByUserId(userId);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getProfileByUserId(user.id);
}
