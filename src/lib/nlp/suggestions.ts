import { faqRepo, faqCategoryRepo } from '../db';
import { Faq } from '../db/types';

/**
 * Generates smart starter questions by sampling representative FAQs from
 * the business's distinct active FAQ categories.
 */
export function generateCategoryStarterQuestions(workspaceId: string, limit = 4): string[] {
  const categories = faqCategoryRepo.listByWorkspace(workspaceId);
  const allFaqs = faqRepo.listByWorkspace(workspaceId, { enabledOnly: true });

  if (allFaqs.length === 0) {
    return [];
  }

  const selectedQuestions: string[] = [];
  const selectedFaqIds = new Set<string>();

  // 1. Pick top FAQ from each active category
  for (const cat of categories) {
    if (selectedQuestions.length >= limit) break;

    const catFaqs = allFaqs
      .filter(f => f.categoryId === cat.id)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    if (catFaqs.length > 0) {
      const topFaq = catFaqs[0];
      selectedQuestions.push(topFaq.question);
      selectedFaqIds.add(topFaq.id);
    }
  }

  // 2. If categories yielded fewer than limit, backfill with top viewed FAQs
  if (selectedQuestions.length < limit) {
    const remainingFaqs = allFaqs
      .filter(f => !selectedFaqIds.has(f.id))
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    for (const faq of remainingFaqs) {
      if (selectedQuestions.length >= limit) break;
      selectedQuestions.push(faq.question);
      selectedFaqIds.add(faq.id);
    }
  }

  return selectedQuestions;
}

/**
 * Generates contextual follow-up questions for a chatbot response.
 * Prioritizes:
 * 1. Sibling questions from the same category as the answered FAQ.
 * 2. High-confidence alternative semantic matches from the vector matcher.
 * 3. Popular general questions if the query was a fallback or unmatched.
 */
export function generateContextualFollowUps(params: {
  workspaceId: string;
  matchedFaq?: Faq;
  alternativeFaqs?: Array<{ id: string; question: string }>;
  limit?: number;
}): string[] {
  const { workspaceId, matchedFaq, alternativeFaqs = [], limit = 3 } = params;
  const allFaqs = faqRepo.listByWorkspace(workspaceId, { enabledOnly: true });

  if (allFaqs.length === 0) {
    return [];
  }

  const followUps: string[] = [];
  const chosenIds = new Set<string>();

  if (matchedFaq) {
    chosenIds.add(matchedFaq.id);

    // 1. Find other questions from the same category
    if (matchedFaq.categoryId) {
      const categorySiblings = allFaqs
        .filter(f => f.categoryId === matchedFaq.categoryId && f.id !== matchedFaq.id)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

      for (const sib of categorySiblings) {
        if (followUps.length >= limit) break;
        followUps.push(sib.question);
        chosenIds.add(sib.id);
      }
    }

    // 2. Add semantic alternative candidates from NLP matcher if space remains
    if (followUps.length < limit && alternativeFaqs.length > 0) {
      for (const alt of alternativeFaqs) {
        if (followUps.length >= limit) break;
        if (!chosenIds.has(alt.id) && alt.question !== matchedFaq.question) {
          followUps.push(alt.question);
          chosenIds.add(alt.id);
        }
      }
    }

    // 3. Match by shared tags if still space
    if (followUps.length < limit && matchedFaq.tags && matchedFaq.tags.length > 0) {
      const tagSet = new Set(matchedFaq.tags.map(t => t.toLowerCase()));
      const tagMatches = allFaqs.filter(f => 
        !chosenIds.has(f.id) && f.tags.some(t => tagSet.has(t.toLowerCase()))
      );

      for (const tm of tagMatches) {
        if (followUps.length >= limit) break;
        followUps.push(tm.question);
        chosenIds.add(tm.id);
      }
    }
  } else {
    // Fallback response: Offer top popular questions across categories
    const categories = faqCategoryRepo.listByWorkspace(workspaceId);
    for (const cat of categories) {
      if (followUps.length >= limit) break;
      const catFaq = allFaqs.find(f => f.categoryId === cat.id && !chosenIds.has(f.id));
      if (catFaq) {
        followUps.push(catFaq.question);
        chosenIds.add(catFaq.id);
      }
    }
  }

  // 4. Backfill from remaining top FAQs if needed
  if (followUps.length < limit) {
    const popularRemaining = allFaqs
      .filter(f => !chosenIds.has(f.id))
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

    for (const f of popularRemaining) {
      if (followUps.length >= limit) break;
      followUps.push(f.question);
      chosenIds.add(f.id);
    }
  }

  return followUps;
}

/**
 * Returns a grouped breakdown of active categories and their representative questions
 * for the dashboard customizer.
 */
export function getCategoryQuestionBreakdown(workspaceId: string) {
  const categories = faqCategoryRepo.listByWorkspace(workspaceId);
  const allFaqs = faqRepo.listByWorkspace(workspaceId, { enabledOnly: true });

  return categories.map(cat => {
    const faqs = allFaqs.filter(f => f.categoryId === cat.id);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      count: faqs.length,
      sampleQuestions: faqs.slice(0, 3).map(f => f.question),
    };
  });
}
