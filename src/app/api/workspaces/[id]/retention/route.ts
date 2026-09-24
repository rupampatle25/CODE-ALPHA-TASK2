import { NextRequest, NextResponse } from 'next/server';
import { workspaceRepo, chatRepo } from '@/lib/db';
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

    const workspace = workspaceRepo.getById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const retentionDays = workspace.retentionDays ?? 90;
    const purgeableCount = chatRepo.getPurgeableCount(workspaceId, retentionDays);

    return NextResponse.json({
      success: true,
      retentionDays,
      purgeableCount,
      policyLabel: retentionDays === 0 ? 'Indefinite (No Auto-Purge)' : `${retentionDays} Days`,
    });
  } catch (error) {
    console.error('Get retention policy error:', error);
    return NextResponse.json({ error: 'Failed to retrieve retention policy' }, { status: 500 });
  }
}

export async function POST(
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
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (role !== 'OWNER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Workspace Owners and Admins can configure data retention policies' }, { status: 403 });
    }

    const { retentionDays, triggerPurge = false } = await req.json();

    let updatedWorkspace = null;
    if (typeof retentionDays === 'number' && retentionDays >= 0) {
      updatedWorkspace = workspaceRepo.update(workspaceId, { retentionDays });
    }

    const workspace = updatedWorkspace || workspaceRepo.getById(workspaceId);
    const activeRetentionDays = workspace?.retentionDays ?? 90;

    let purgeResult = { deletedSessions: 0, deletedMessages: 0 };
    if (triggerPurge && activeRetentionDays > 0) {
      purgeResult = chatRepo.purgeOldSessions(workspaceId, activeRetentionDays);
    }

    return NextResponse.json({
      success: true,
      retentionDays: activeRetentionDays,
      purged: purgeResult,
      message: triggerPurge 
        ? `Purged ${purgeResult.deletedSessions} expired conversations and ${purgeResult.deletedMessages} messages older than ${activeRetentionDays} days.`
        : `Data retention policy updated to ${activeRetentionDays === 0 ? 'Indefinite' : `${activeRetentionDays} days`}.`,
    });
  } catch (error) {
    console.error('Update retention policy error:', error);
    return NextResponse.json({ error: 'Failed to update retention policy' }, { status: 500 });
  }
}
