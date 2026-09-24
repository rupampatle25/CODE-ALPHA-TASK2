import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userRepo, workspaceRepo } from '@/lib/db';
import { verifyPassword, signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, isAdminLogin } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = userRepo.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // When logging via dedicated Admin Portal, ensure user has administrator role
    if (isAdminLogin && user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json({
        error: 'Access denied: This account does not possess administrator privileges',
      }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const token = signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set('sahayak_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    const workspaces = workspaceRepo.listForUser(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      workspaces,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
