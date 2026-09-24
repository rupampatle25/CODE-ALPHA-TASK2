import { NextRequest, NextResponse } from 'next/server';
import { supportTicketRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess, getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { id: workspaceId, ticketId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess || role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const user = await getCurrentUser();
    const body = await req.json();

    const updated = supportTicketRepo.update(workspaceId, ticketId, {
      status: body.status,
      priority: body.priority,
      resolutionNotes: body.resolutionNotes,
      resolvedBy: body.status === 'RESOLVED' ? (user?.name || 'Staff') : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Update support ticket error:', error);
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
  }
}
