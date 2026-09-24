import { NextRequest, NextResponse } from 'next/server';
import { faqRepo, chatRepo, quotaRepo, workspaceRepo } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { defaultMatcher } from '@/lib/nlp/matcher';
import { generateContextualFollowUps } from '@/lib/nlp/suggestions';
import { translator } from '@/lib/translation/translator';
import { SupportedLanguage } from '@/lib/translation/languages';
import { sanitizeContent } from '@/lib/privacy/sanitizer';

export async function POST(req: NextRequest) {
  try {
    const { 
      workspaceId, 
      query, 
      sessionId, 
      channel = 'DASHBOARD',
      language = 'en' as SupportedLanguage 
    } = await req.json();

    let activeWorkspaceId = workspaceId;
    if (!activeWorkspaceId) {
      const session = await getSession();
      if (session) {
        const userWorkspaces = workspaceRepo.listForUser(session.userId);
        if (userWorkspaces.length > 0) {
          activeWorkspaceId = userWorkspaces[0].id;
        }
      }
    }
    if (!activeWorkspaceId) {
      activeWorkspaceId = 'ws_technova_demo';
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required and cannot be empty' }, { status: 400 });
    }

    if (query.length > 500) {
      return NextResponse.json({ error: 'Query exceeds maximum allowed length of 500 characters' }, { status: 400 });
    }

    const workspace = workspaceRepo.getById(activeWorkspaceId);
    if (!workspace) {
      activeWorkspaceId = 'ws_technova_demo';
    }

    // Check usage quota
    const quotaCheck = quotaRepo.checkLimit(activeWorkspaceId);
    if (!quotaCheck.allowed) {
      const quotaMsg = language === 'hi' 
        ? 'इस कार्यक्षेत्र ने अपना मासिक बातचीत भत्ता समाप्त कर लिया है।'
        : language === 'mr'
        ? 'या कार्यक्षेत्राने मासिक संभाषण मर्यादा ओलांडली आहे.'
        : 'This workspace has reached its monthly conversation allowance. Please contact the workspace owner to upgrade their plan.';

      return NextResponse.json({
        matched: false,
        answer: quotaMsg,
        confidence: 0,
        isFallback: true,
        latencyMs: 1,
        quotaExceeded: true,
      });
    }

    // 1. Multilingual Query Translation to English for the NLP Engine
    const { englishQuery, wasTranslated: queryWasTranslated } = translator.translateQueryToEnglish(query, language);

    // 2. Get active FAQs for this tenant workspace
    const faqs = faqRepo.listByWorkspace(activeWorkspaceId, { enabledOnly: true });

    // 3. Execute NLP retrieval pipeline on the English query
    const matchResult = defaultMatcher.match(englishQuery, faqs);

    // 4. Translate Grounded Answer into the user's selected language
    const { translatedAnswer, originalAnswer, isTranslated: answerWasTranslated } = translator.translateAnswer(
      matchResult.answer,
      language,
      matchResult.faq?.id
    );

    // 5. Generate contextual follow-up suggestions from category & related knowledge base
    const followUpQuestions = generateContextualFollowUps({
      workspaceId: activeWorkspaceId,
      matchedFaq: matchResult.faq,
      alternativeFaqs: matchResult.alternativeFaqs,
      limit: 3,
    });

    const translatedFollowUps = translator.translateQuestionList(
      followUpQuestions,
      language
    );

    // 6. Translate any alternative suggestions
    const translatedAlternatives = translator.translateAlternativeQuestions(
      matchResult.alternativeFaqs || [],
      language
    );

    // Increment usage
    quotaRepo.incrementUsage(activeWorkspaceId);

    // Handle or create chat session
    const sessionType = channel === 'WIDGET' ? 'VISITOR' : 'ADMIN';
    const activeSessionId = sessionId || chatRepo.createSession(activeWorkspaceId, channel, undefined, undefined, sessionType).id;

    // Sanitize user query before persistence (PII scrubbing)
    const { sanitized, hasPii, redactedTypes } = sanitizeContent(query.trim());

    // Record user message
    chatRepo.addMessage({
      sessionId: activeSessionId,
      workspaceId: activeWorkspaceId,
      role: 'USER',
      content: sanitized,
      hasPii,
      redactedTypes,
      isFallback: false,
      latencyMs: 0,
    });

    // Record assistant message
    const assistantMsg = chatRepo.addMessage({
      sessionId: activeSessionId,
      workspaceId: activeWorkspaceId,
      role: 'ASSISTANT',
      content: translatedAnswer,
      matchedFaqId: matchResult.faq?.id,
      similarityScore: matchResult.confidence,
      isFallback: matchResult.isFallback,
      latencyMs: matchResult.latencyMs,
    });

    // Increment FAQ view count if matched
    if (matchResult.matched && matchResult.faq) {
      faqRepo.incrementViewCount(activeWorkspaceId, matchResult.faq.id);
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
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: 'Failed to process chat query' }, { status: 500 });
  }
}
