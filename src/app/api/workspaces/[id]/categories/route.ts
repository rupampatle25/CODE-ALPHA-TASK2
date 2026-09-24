import { NextRequest, NextResponse } from 'next/server';
import { faqCategoryRepo } from '@/lib/db';
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

    const categories = faqCategoryRepo.listByWorkspace(workspaceId);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 });
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, color } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = faqCategoryRepo.create(workspaceId, name.trim(), color);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    let categoryId = searchParams.get('categoryId');
    if (!categoryId) {
      try {
        const body = await req.json();
        categoryId = body?.categoryId;
      } catch {
        // ignore JSON parse error if body is empty
      }
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const deleted = faqCategoryRepo.delete(workspaceId, categoryId);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
