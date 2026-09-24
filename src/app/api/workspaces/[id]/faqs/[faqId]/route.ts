import { NextRequest, NextResponse } from 'next/server';
import { faqRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const { id: workspaceId, faqId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess || role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updated = faqRepo.update(workspaceId, faqId, body);
    if (!updated) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, faq: updated });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const { id: workspaceId, faqId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess || role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deleted = faqRepo.delete(workspaceId, faqId);
    if (!deleted) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
