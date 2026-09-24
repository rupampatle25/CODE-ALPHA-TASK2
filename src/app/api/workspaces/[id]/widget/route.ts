import { NextRequest, NextResponse } from 'next/server';
import { widgetRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = widgetRepo.getByWorkspaceId(workspaceId);
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Get widget config error:', error);
    return NextResponse.json({ error: 'Failed to retrieve widget config' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess || role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updated = widgetRepo.update(workspaceId, body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('Update widget config error:', error);
    return NextResponse.json({ error: 'Failed to update widget config' }, { status: 500 });
  }
}
