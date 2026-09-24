import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('sahayak_session');
  cookieStore.delete('faqpilot_session');

  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
