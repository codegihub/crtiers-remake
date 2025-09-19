import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || '__crt_' + crypto.createHash('sha256').update('name').digest('hex').slice(0, 12);
const SECRET = process.env.ADMIN_SECRET || 'CHANGE_ME_SECRET';

function verify(token: string): boolean {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { exp?: number };
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verify(token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';

