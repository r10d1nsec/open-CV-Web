/**
 * Minimal iCalendar (RFC 5545) event generator.
 * Sprint 2: cliente genera y dispara descarga local.
 * Sprint 7: el servidor lo emite tras crear el evento en Google Calendar.
 */

export type IcsEventInput = {
  uid: string;
  summary: string;
  description?: string;
  startUtc: Date;
  endUtc: Date;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  location?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toIcsDate(date: Date): string {
  return (
    String(date.getUTCFullYear()) +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function generateIcs(input: IcsEventInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Folio//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${input.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(input.startUtc)}`,
    `DTEND:${toIcsDate(input.endUtc)}`,
    `SUMMARY:${escapeIcs(input.summary)}`,
  ];
  if (input.description) lines.push(`DESCRIPTION:${escapeIcs(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeIcs(input.location)}`);
  if (input.organizerEmail) {
    const cn = input.organizerName ? `;CN=${escapeIcs(input.organizerName)}` : '';
    lines.push(`ORGANIZER${cn}:mailto:${input.organizerEmail}`);
  }
  if (input.attendeeEmail) {
    const cn = input.attendeeName ? `;CN=${escapeIcs(input.attendeeName)}` : '';
    lines.push(`ATTENDEE${cn};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:${input.attendeeEmail}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
