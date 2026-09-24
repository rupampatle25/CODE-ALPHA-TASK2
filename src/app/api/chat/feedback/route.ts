import { NextRequest, NextResponse } from 'next/server';
import { chatRepo } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { messageId, workspaceId, rating, comment } = await req.json();

    if (!messageId || !workspaceId || !rating) {
      return NextResponse.json({ error: 'messageId, workspaceId, and rating are required' }, { status: 400 });
    }

    if (rating !== 'HELPFUL' && rating !== 'UNHELPFUL') {
      return NextResponse.json({ error: 'rating must be HELPFUL or UNHELPFUL' }, { status: 400 });
    }

    const feedback = chatRepo.addFeedback({
      messageId,
      workspaceId,
      rating,
      comment,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
