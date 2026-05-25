import { NextResponse } from 'next/server';
import { generateVCard, vcardFilename } from '@/lib/vcard';
import { getProfileByUsername } from '@/lib/profile-store';

type RouteParams = { params: Promise<{ username: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const body = generateVCard(profile);
  const filename = vcardFilename(profile);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
