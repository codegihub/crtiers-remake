import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || '__crt_' + crypto.createHash('sha256').update('name').digest('hex').slice(0, 12);

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export const dynamic = 'force-dynamic';

