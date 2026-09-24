import { NextRequest, NextResponse } from 'next/server';
import { widgetRepo, faqRepo, chatRepo, quotaRepo } from '@/lib/db';
import { defaultMatcher } from '@/lib/nlp/matcher';
import { generateContextualFollowUps } from '@/lib/nlp/suggestions';
import { translator } from '@/lib/translation/translator';
import { SupportedLanguage } from '@/lib/translation/languages';
import { sanitizeContent } from '@/lib/privacy/sanitizer';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const config = widgetRepo.getByPublicId(publicId);

    if (!config) {
      return NextResponse.json({ error: 'Chatbot widget not found' }, { status: 404 });
    }

    const { query, sessionId, language = 'en' as SupportedLanguage } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    const workspaceId = config.workspaceId;

    // Quota check
    const quotaCheck = quotaRepo.checkLimit(workspaceId);
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        matched: false,
        answer: 'This assistant has reached its monthly conversation allowance. Please try again later.',
        confidence: 0,
        isFallback: true,
        latencyMs: 1,
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 1. Multilingual Query Translation to English for the NLP Engine
    const { englishQuery, wasTranslated: queryWasTranslated } = translator.translateQueryToEnglish(query, language);

    const faqs = faqRepo.listByWorkspace(workspaceId, { enabledOnly: true });
    const matchResult = defaultMatcher.match(englishQuery, faqs);

    // 2. Translate Answer
    const { translatedAnswer, originalAnswer, isTranslated: answerWasTranslated } = translator.translateAnswer(
      matchResult.answer,
      language,
      matchResult.faq?.id
    );

    const followUpQuestions = generateContextualFollowUps({
      workspaceId,
      matchedFaq: matchResult.faq,
      alternativeFaqs: matchResult.alternativeFaqs,
      limit: 3,
    });

    const translatedFollowUps = translator.translateQuestionList(
      followUpQuestions,
      language
    );

    const translatedAlternatives = translator.translateAlternativeQuestions(
      matchResult.alternativeFaqs || [],
      language
    );

    quotaRepo.incrementUsage(workspaceId);

    const activeSessionId = sessionId || chatRepo.createSession(workspaceId, 'WIDGET', undefined, undefined, 'VISITOR').id;

    // Sanitize user query before persistence (PII scrubbing)
    const { sanitized, hasPii, redactedTypes } = sanitizeContent(query.trim());

    chatRepo.addMessage({
      sessionId: activeSessionId,
      workspaceId,
      role: 'USER',
      content: sanitized,
      hasPii,
      redactedTypes,
      isFallback: false,
      latencyMs: 0,
    });

    const assistantMsg = chatRepo.addMessage({
      sessionId: activeSessionId,
      workspaceId,
      role: 'ASSISTANT',
      content: translatedAnswer,
      matchedFaqId: matchResult.faq?.id,
      similarityScore: matchResult.confidence,
      isFallback: matchResult.isFallback,
      latencyMs: matchResult.latencyMs,
    });

    if (matchResult.matched && matchResult.faq) {
      faqRepo.incrementViewCount(workspaceId, matchResult.faq.id);
    }

    return NextResponse.json({
      success: true,
      messageId: assistantMsg.id,
      sessionId: activeSessionId,
      answer: translatedAnswer,
      originalAnswer: language !== 'en' ? originalAnswer : undefined,
      language,
      wasTranslated: queryWasTranslated || answerWasTranslated,
      confidence: matchResult.confidence,
      isFallback: matchResult.isFallback,
      latencyMs: matchResult.latencyMs,
      sourceQuestion: matchResult.sourceQuestion,
      alternativeFaqs: translatedAlternatives,
      suggestedQuestions: translatedFollowUps,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Public widget chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
