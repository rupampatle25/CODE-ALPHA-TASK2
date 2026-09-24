import { generateCategoryStarterQuestions, generateContextualFollowUps, getCategoryQuestionBreakdown } from '../src/lib/nlp/suggestions';
import { translator } from '../src/lib/translation/translator';
import { faqRepo, faqCategoryRepo } from '../src/lib/db';

async function runTests() {
  console.log('========================================================');
  console.log('Sahayak AI: Smart Suggested Questions Verification Tests');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  const workspaceId = 'ws_technova_demo';

  // --- TEST GROUP 1: Category Starter Questions Generator ---
  console.log('--- TEST GROUP 1: Category Starter Questions Generator ---');
  const starterQuestions = generateCategoryStarterQuestions(workspaceId, 4);
  assert(starterQuestions.length > 0, `Generated ${starterQuestions.length} starter questions`);
  assert(starterQuestions.length <= 4, 'Starter questions count does not exceed limit');
  
  const allFaqs = faqRepo.listByWorkspace(workspaceId, { enabledOnly: true });
  const allQuestions = new Set(allFaqs.map(f => f.question));
  const allStartersValid = starterQuestions.every(q => allQuestions.has(q));
  assert(allStartersValid, 'All starter questions originate from verified active knowledge base FAQs');

  // --- TEST GROUP 2: Diversity Across Categories ---
  console.log('\n--- TEST GROUP 2: Category Breakdown & Coverage ---');
  const breakdown = getCategoryQuestionBreakdown(workspaceId);
  assert(breakdown.length >= 3, `Workspace has ${breakdown.length} active FAQ categories`);
  
  const categoriesCovered = new Set<string>();
  for (const q of starterQuestions) {
    const matchedFaq = allFaqs.find(f => f.question === q);
    if (matchedFaq?.categoryId) {
      categoriesCovered.add(matchedFaq.categoryId);
    }
  }
  assert(categoriesCovered.size >= 2, `Starter questions span multiple distinct categories (${categoriesCovered.size} categories covered)`);

  // --- TEST GROUP 3: Contextual Follow-up Suggestions After Answer ---
  console.log('\n--- TEST GROUP 3: Contextual Follow-up Suggestions ---');
  const pricingFaq = allFaqs.find(f => f.id === 'faq_1'); // 'What subscription pricing plans do you offer?' (cat_billing)
  assert(Boolean(pricingFaq), 'Retrieved sample pricing FAQ (faq_1)');

  if (pricingFaq) {
    const followUps = generateContextualFollowUps({
      workspaceId,
      matchedFaq: pricingFaq,
      limit: 3,
    });

    assert(followUps.length > 0, `Generated ${followUps.length} follow-up questions for pricing FAQ`);
    assert(!followUps.includes(pricingFaq.question), 'Follow-up questions do not repeat the answered question itself');
    
    // Check that at least one sibling from cat_billing is included (if available)
    const billingFaqs = allFaqs.filter(f => f.categoryId === 'cat_billing' && f.id !== pricingFaq.id);
    if (billingFaqs.length > 0) {
      const hasSibling = followUps.some(q => billingFaqs.some(bf => bf.question === q));
      assert(hasSibling, 'Follow-up questions prioritize siblings from the same category');
    }
  }

  // --- TEST GROUP 4: Fallback Query Suggestions ---
  console.log('\n--- TEST GROUP 4: Fallback Navigation Suggestions ---');
  const fallbackSuggestions = generateContextualFollowUps({
    workspaceId,
    matchedFaq: undefined, // Simulating an out-of-domain fallback
    limit: 3,
  });
  assert(fallbackSuggestions.length > 0, `Generated ${fallbackSuggestions.length} navigation suggestions on fallback`);
  assert(new Set(fallbackSuggestions).size === fallbackSuggestions.length, 'Fallback suggestions are distinct');

  // --- TEST GROUP 5: Multilingual Question Translation ---
  console.log('\n--- TEST GROUP 5: Multilingual Translation of Suggestions ---');
  const sampleQuestions = [
    'What subscription pricing plans do you offer?',
    'What is your refund and cancellation policy?',
  ];

  const hindiTranslated = translator.translateQuestionList(sampleQuestions, 'hi');
  assert(hindiTranslated.length === 2, 'Translated question list matches input length');
  assert(hindiTranslated[0].includes('मूल्य निर्धारण') || hindiTranslated[0] !== sampleQuestions[0], 'First question translated to Hindi');

  const marathiTranslated = translator.translateQuestionList(sampleQuestions, 'mr');
  assert(marathiTranslated[0].includes('किंमत') || marathiTranslated[0] !== sampleQuestions[0], 'First question translated to Marathi');

  const englishPreserved = translator.translateQuestionList(sampleQuestions, 'en');
  assert(englishPreserved[0] === sampleQuestions[0], 'English question list preserved identically');

  // --- SUMMARY ---
  console.log('\n========================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
