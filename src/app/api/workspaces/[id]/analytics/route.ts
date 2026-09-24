import { NextRequest, NextResponse } from 'next/server';
import { analyticsRepo } from '@/lib/db';
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

    const metrics = analyticsRepo.getWorkspaceMetrics(workspaceId);
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 });
  }
}
