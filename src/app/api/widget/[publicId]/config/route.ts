import { NextRequest, NextResponse } from 'next/server';
import { widgetRepo } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const config = widgetRepo.getByPublicId(publicId);

    if (!config) {
      return NextResponse.json({ error: 'Chatbot widget not found' }, { status: 404 });
    }

    // Return only safe public configuration
    return NextResponse.json({
      publicId: config.publicId,
      botName: config.botName,
      welcomeMessage: config.welcomeMessage,
      primaryColor: config.primaryColor,
      suggestedQuestions: config.suggestedQuestions,
      workspaceName: config.workspaceName,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Public widget config error:', error);
    return NextResponse.json({ error: 'Failed to retrieve widget config' }, { status: 500 });
  }
}
