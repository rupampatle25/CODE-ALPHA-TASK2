import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyWorkspaceAccess } from '@/lib/auth';
import { faqRepo, faqCategoryRepo } from '@/lib/db';
import { NEW_100_FAQS, SEED_CATEGORIES } from '@/lib/data/faqs-seed-data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!hasAccess || (role !== 'OWNER' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Owner privileges required' }, { status: 403 });
    }

    // 1. Synchronize Categories
    const existingCategories = faqCategoryRepo.listByWorkspace(workspaceId);
    const categoryIdMap: Record<string, string> = {};

    for (const [key, catMeta] of Object.entries(SEED_CATEGORIES)) {
      const existing = existingCategories.find(c => c.id === catMeta.id || c.name.toLowerCase() === catMeta.name.toLowerCase());
      if (existing) {
        categoryIdMap[key] = existing.id;
      } else {
        const created = faqCategoryRepo.create(workspaceId, catMeta.name, catMeta.color);
        categoryIdMap[key] = created.id;
      }
    }

    // 2. Scan existing FAQs to prevent duplicates
    const existingFaqs = faqRepo.listByWorkspace(workspaceId);
    const existingSet = new Set(
      existingFaqs.map(f => f.question.toLowerCase().trim().replace(/[?!.,]/g, ''))
    );

    let inserted = 0;
    let skipped = 0;

    for (const item of NEW_100_FAQS) {
      const normQ = item.question.toLowerCase().trim().replace(/[?!.,]/g, '');
      if (existingSet.has(normQ)) {
        skipped++;
        continue;
      }

      const catId = categoryIdMap[item.categoryKey] || SEED_CATEGORIES[item.categoryKey].id;
      faqRepo.create(workspaceId, {
        question: item.question,
        answer: item.answer,
        categoryId: catId,
        tags: item.tags,
        isEnabled: true,
      });

      existingSet.add(normQ);
      inserted++;
    }

    const updatedTotal = faqRepo.listByWorkspace(workspaceId).length;

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      totalFaqs: updatedTotal,
      message: `Successfully processed 100 FAQs (${inserted} newly inserted, ${skipped} duplicates skipped).`,
    });
  } catch (error) {
    console.error('Seed FAQs API error:', error);
    return NextResponse.json({ error: 'Failed to seed FAQs' }, { status: 500 });
  }
}
