import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours
const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || '__crt_' + crypto.createHash('sha256').update('name').digest('hex').slice(0, 12);
const SECRET = process.env.ADMIN_SECRET || 'CHANGE_ME_SECRET';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function sign(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exp = Date.now() + TOKEN_TTL_MS;
    const token = sign({ exp, r: crypto.randomBytes(8).toString('hex') });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: TOKEN_TTL_MS / 1000,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

