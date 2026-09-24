import { dbStore } from '../src/lib/db/store';
import { faqRepo, faqCategoryRepo } from '../src/lib/db';
import { NEW_100_FAQS, SEED_CATEGORIES } from '../src/lib/data/faqs-seed-data';

async function seed100Faqs() {
  console.log('========================================================');
  console.log('Sahayak AI: Seeding 100 New Categorized FAQs');
  console.log('========================================================\n');

  const workspaceId = 'ws_technova_demo';
  const db = dbStore.read();
  
  const workspace = db.workspaces.find(w => w.id === workspaceId);
  if (!workspace) {
    console.error(`❌ Workspace ${workspaceId} not found!`);
    process.exit(1);
  }

  console.log(`Target Workspace: "${workspace.name}" (${workspace.id})`);

  // 1. Ensure all 7 categories exist in the workspace
  console.log('\n--- Step 1: Synchronizing FAQ Categories ---');
  const existingCategories = faqCategoryRepo.listByWorkspace(workspaceId);
  const categoryIdMap: Record<string, string> = {};

  for (const [key, catMeta] of Object.entries(SEED_CATEGORIES)) {
    const existingCat = existingCategories.find(c => c.id === catMeta.id || c.name.toLowerCase() === catMeta.name.toLowerCase());
    
    if (!existingCat) {
      // Create new category
      const created = faqCategoryRepo.create(workspaceId, catMeta.name, catMeta.color);
      categoryIdMap[key] = created.id;
      console.log(`✅ Created category: "${catMeta.name}" (id: ${created.id})`);
    } else {
      // Category exists; ensure name and color match metadata
      existingCat.name = catMeta.name;
      existingCat.color = catMeta.color;
      categoryIdMap[key] = existingCat.id;
      console.log(`✓ Synchronized existing category: "${catMeta.name}" (id: ${existingCat.id})`);
    }
  }

  // Update categories in database
  dbStore.write(db);

  // 2. Scan existing FAQs to prevent duplicates
  console.log('\n--- Step 2: Scanning Existing FAQs for Duplicates ---');
  const existingFaqs = faqRepo.listByWorkspace(workspaceId);
  console.log(`Found ${existingFaqs.length} existing FAQs in workspace.`);
  
  const existingQuestionSet = new Set(
    existingFaqs.map(f => f.question.toLowerCase().trim().replace(/[?!.,]/g, ''))
  );

  // 3. Prepare and insert the 100 new FAQs
  console.log('\n--- Step 3: Inserting 100 New Categorized FAQs ---');
  let skippedCount = 0;
  const categoryCounts: Record<string, number> = {};
  const itemsToInsert: Array<{ question: string; answer: string; categoryId?: string; tags?: string[] }> = [];

  for (const item of NEW_100_FAQS) {
    const normalizedQ = item.question.toLowerCase().trim().replace(/[?!.,]/g, '');
    
    if (existingQuestionSet.has(normalizedQ)) {
      console.log(`⚠️ Skipping duplicate question: "${item.question}"`);
      skippedCount++;
      continue;
    }

    const resolvedCategoryId = categoryIdMap[item.categoryKey] || SEED_CATEGORIES[item.categoryKey].id;

    itemsToInsert.push({
      question: item.question,
      answer: item.answer,
      categoryId: resolvedCategoryId,
      tags: item.tags,
    });

    existingQuestionSet.add(normalizedQ);
    categoryCounts[item.categoryKey] = (categoryCounts[item.categoryKey] || 0) + 1;
  }

  const insertedCount = faqRepo.bulkCreate(workspaceId, itemsToInsert);

  // 4. Verify Final Database Counts
  const updatedFaqs = faqRepo.listByWorkspace(workspaceId);
  console.log('\n========================================================');
  console.log('Seeding Summary Report:');
  console.log(`- Initial FAQs: ${existingFaqs.length}`);
  console.log(`- New FAQs Inserted: ${insertedCount}`);
  console.log(`- Duplicates Skipped: ${skippedCount}`);
  console.log(`- Total FAQs in Workspace: ${updatedFaqs.length}`);
  console.log('\nBreakdown by Category:');
  for (const [key, count] of Object.entries(categoryCounts)) {
    console.log(`  • ${SEED_CATEGORIES[key].name}: ${count} FAQs`);
  }
  console.log('========================================================\n');

  if (insertedCount === 100 || (insertedCount + skippedCount === 100 && updatedFaqs.length >= 110)) {
    console.log('🎉 SUCCESS: All 100 FAQs successfully processed into the database!');
  } else {
    console.error(`❌ Unexpected count: Expected 100 FAQs, but processed ${insertedCount} inserted and ${skippedCount} skipped.`);
    process.exit(1);
  }
}

seed100Faqs().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
