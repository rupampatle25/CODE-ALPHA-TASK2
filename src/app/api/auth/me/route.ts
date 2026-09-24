import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { userRepo, workspaceRepo } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = userRepo.findById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const workspaces = workspaceRepo.listForUser(user.id);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    workspaces,
  });
}
