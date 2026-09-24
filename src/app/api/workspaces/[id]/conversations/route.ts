import { NextRequest, NextResponse } from 'next/server';
import { chatRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';
import { SessionType, SessionStatus } from '@/lib/db/types';

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

    const { searchParams } = new URL(req.url);
    const sessionType = (searchParams.get('sessionType') as 'ALL' | SessionType) || undefined;
    const status = (searchParams.get('status') as 'ALL' | SessionStatus) || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = chatRepo.listSessions(workspaceId, {
      sessionType,
      status,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      sessions: result.sessions,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversations' }, { status: 500 });
  }
}
