/**
 * Tests for the contact form validator (Sprint 6 S6.2).
 *
 * Refs: spec:012 §Non-functional, lib/validation/contact.ts.
 */
import { describe, expect, it } from 'vitest';
import { ContactSchema } from '@/lib/validation/contact';

const valid = {
  name: 'María García',
  email: 'maria@example.com',
  message: 'Hola, vi tu portfolio y me encantaría conocer más sobre tu proyecto Tessera.',
  honeypot: '',
};

describe('ContactSchema', () => {
  it('accepts a well-formed contact', () => {
    expect(ContactSchema.parse(valid)).toMatchObject({
      name: valid.name,
      email: valid.email,
      message: valid.message,
      honeypot: '',
    });
  });

  it.each([
    ['name empty', { ...valid, name: '' }],
    ['name 1 char', { ...valid, name: 'a' }],
    ['name too long', { ...valid, name: 'a'.repeat(81) }],
    ['email invalid', { ...valid, email: 'not-an-email' }],
    ['email empty', { ...valid, email: '' }],
    ['message too short', { ...valid, message: 'corto' }],
    ['message empty', { ...valid, message: '' }],
    ['message too long', { ...valid, message: 'a'.repeat(2001) }],
  ])('rejects invalid contact (%s)', (_, input) => {
    expect(() => ContactSchema.parse(input)).toThrow();
  });

  it('trims surrounding whitespace in name and message', () => {
    const out = ContactSchema.parse({
      ...valid,
      name: '  María  ',
      message: '  ' + valid.message + '  ',
    });
    expect(out.name).toBe('María');
    expect(out.message).toBe(valid.message);
  });

  it('lowercases email', () => {
    const out = ContactSchema.parse({ ...valid, email: 'MARIA@EXAMPLE.COM' });
    expect(out.email).toBe('maria@example.com');
  });

  it('preserves honeypot string for downstream check (empty string OK)', () => {
    expect(ContactSchema.parse(valid).honeypot).toBe('');
  });

  it('accepts honeypot as missing (defaults to empty string)', () => {
    const { honeypot, ...rest } = valid;
    void honeypot;
    expect(ContactSchema.parse(rest).honeypot).toBe('');
  });
});
