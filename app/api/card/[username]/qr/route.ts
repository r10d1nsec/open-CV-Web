import { NextResponse, type NextRequest } from 'next/server';
import { getProfileByUsername } from '@/lib/profile-store';
import { renderQrPng, renderQrSvg, type QrFormat } from '@/lib/qr';

type RouteParams = { params: Promise<{ username: string }> };

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const format = (req.nextUrl.searchParams.get('format') ?? 'png') as QrFormat;
  const widthParam = Number(req.nextUrl.searchParams.get('width'));
  const width = Number.isFinite(widthParam) && widthParam >= 64 && widthParam <= 2048
    ? widthParam
    : 512;

  const cardUrl = `${req.nextUrl.origin}/c/${username}`;

  if (format === 'svg') {
    const svg = await renderQrSvg(cardUrl);
    return new NextResponse(svg, {
      status: 200,
      headers: { ...CACHE_HEADERS, 'Content-Type': 'image/svg+xml; charset=utf-8' },
    });
  }

  const png = await renderQrPng(cardUrl, width);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: { ...CACHE_HEADERS, 'Content-Type': 'image/png' },
  });
}
