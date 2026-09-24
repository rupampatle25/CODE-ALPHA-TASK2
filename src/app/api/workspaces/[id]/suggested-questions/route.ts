import { NextRequest, NextResponse } from 'next/server';
import { generateCategoryStarterQuestions, getCategoryQuestionBreakdown } from '@/lib/nlp/suggestions';
import { widgetRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') || 'all';

    const categoryQuestions = generateCategoryStarterQuestions(workspaceId, 4);
    const categoryBreakdown = getCategoryQuestionBreakdown(workspaceId);

    const widget = widgetRepo.getByWorkspaceId(workspaceId);
    const customConfigured = widget?.suggestedQuestions || [];

    if (mode === 'starter') {
      // If widget has custom questions configured and not empty, return those; otherwise return category-based
      const questions = customConfigured.length > 0 ? customConfigured : categoryQuestions;
      return NextResponse.json({ questions, isCustom: customConfigured.length > 0 });
    }

    return NextResponse.json({
      success: true,
      categoryQuestions,
      customConfigured,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Suggested questions error:', error);
    return NextResponse.json({ error: 'Failed to retrieve suggestions' }, { status: 500 });
  }
}
