import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userRepo, workspaceRepo } from '@/lib/db';
import { hashPassword, signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, workspaceName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existingUser = userRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = userRepo.create({
      email,
      name,
      passwordHash,
      role: 'OWNER',
    });

    // Create user's initial isolated workspace
    const wsName = workspaceName?.trim() || `${name}'s Workspace`;
    const newWorkspace = workspaceRepo.create({
      name: wsName,
      description: `Default workspace for ${name}`,
      ownerId: newUser.id,
    });

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = signSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
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

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      workspace: newWorkspace,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
