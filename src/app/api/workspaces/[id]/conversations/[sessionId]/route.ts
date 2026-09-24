import { NextRequest, NextResponse } from 'next/server';
import { chatRepo } from '@/lib/db';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: workspaceId, sessionId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const conversation = chatRepo.getSessionWithMessages(workspaceId, sessionId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: conversation.session,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversation transcript' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: workspaceId, sessionId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Role check: Only OWNER, ADMIN, or EDITOR can delete conversations
    if (role === 'VIEWER') {
      return NextResponse.json({ error: 'Viewers do not have permission to delete conversation history' }, { status: 403 });
    }

    const deleted = chatRepo.deleteSession(workspaceId, sessionId);
    if (!deleted) {
      return NextResponse.json({ error: 'Conversation session not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation and all associated message records deleted successfully.',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
