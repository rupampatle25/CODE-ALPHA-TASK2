import { NextRequest, NextResponse } from 'next/server';
import { supportTicketRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';
import { TicketPriority, TicketStatus } from '@/lib/db/types';

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
    const status = (searchParams.get('status') as TicketStatus) || undefined;
    const priority = (searchParams.get('priority') as TicketPriority) || undefined;
    const search = searchParams.get('search') || undefined;

    const tickets = supportTicketRepo.listByWorkspace(workspaceId, { status, priority, search });
    const stats = supportTicketRepo.getStats(workspaceId);

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    console.error('List support tickets error:', error);
    return NextResponse.json({ error: 'Failed to retrieve support tickets' }, { status: 500 });
  }
}
