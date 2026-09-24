import { NextRequest, NextResponse } from 'next/server';
import { faqRepo, workspaceRepo } from '@/lib/db';
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const enabledOnly = searchParams.get('enabledOnly') === 'true';

    const faqs = faqRepo.listByWorkspace(workspaceId, { search, categoryId, enabledOnly });
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('List FAQs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve FAQs' }, { status: 500 });
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
    if (!hasAccess || role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Insufficient workspace permissions' }, { status: 403 });
    }

    const { question, answer, categoryId, tags, isEnabled } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    // Check duplicate or near-duplicate
    const existing = faqRepo.listByWorkspace(workspaceId);
    const isDuplicate = existing.some(
      f => f.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    if (isDuplicate) {
      return NextResponse.json({ error: 'An identical question already exists in this workspace.' }, { status: 409 });
    }

    const newFaq = faqRepo.create(workspaceId, {
      question,
      answer,
      categoryId,
      tags: Array.isArray(tags) ? tags : [],
      isEnabled: isEnabled ?? true,
    });

    return NextResponse.json({ success: true, faq: newFaq }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}

// Bulk CSV or JSON Import
export async function PUT(
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
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'An array of items with question and answer is required' }, { status: 400 });
    }

    const importedCount = faqRepo.bulkCreate(workspaceId, items);

    return NextResponse.json({ success: true, importedCount });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Failed to bulk import FAQs' }, { status: 500 });
  }
}
