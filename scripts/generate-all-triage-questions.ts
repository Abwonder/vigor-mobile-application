/**
 * Script to Pre-Generate Triage Questions for All Symptoms
 *
 * This script calls the AI Edge Function to generate questions for all symptoms
 * in your database. Run this ONCE to populate questions for all symptoms.
 *
 * Usage:
 *   1. Install dependencies: npm install
 *   2. Make sure your Edge Functions are deployed
 *   3. Run: npx ts-node scripts/generate-all-triage-questions.ts
 *
 * Cost: ~$0.06 per symptom × number of symptoms
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Symptom {
  id: string;
  name: string;
  category: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateQuestionsForSymptom(symptom: Symptom): Promise<boolean> {
  try {
    console.log(`\n📝 Generating questions for: ${symptom.name} (${symptom.category})`);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-triage-questions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptomName: symptom.name,
          symptomCategory: symptom.category,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`   ❌ Failed: ${error}`);
      return false;
    }

    const data = await response.json();

    if (data.cached) {
      console.log(`   ✅ Already exists (loaded from cache)`);
    } else {
      console.log(`   ✅ Generated ${data.questions.length} questions`);
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting triage question generation...\n');

  // Fetch all symptoms from database
  const { data: symptoms, error } = await supabase
    .from('symptoms_catalog')
    .select('id, name, category')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch symptoms:', error);
    process.exit(1);
  }

  if (!symptoms || symptoms.length === 0) {
    console.log('No symptoms found in database.');
    process.exit(0);
  }

  console.log(`Found ${symptoms.length} symptoms to process\n`);
  console.log('─'.repeat(60));

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  // Process symptoms by category
  const categoriesMap = new Map<string, Symptom[]>();

  symptoms.forEach((symptom: Symptom) => {
    const category = symptom.category || 'Uncategorized';
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, []);
    }
    categoriesMap.get(category)!.push(symptom);
  });

  for (const [category, categorySymptoms] of categoriesMap) {
    console.log(`\n📂 Category: ${category} (${categorySymptoms.length} symptoms)`);
    console.log('─'.repeat(60));

    for (const symptom of categorySymptoms) {
      const success = await generateQuestionsForSymptom(symptom);

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Rate limiting: Wait 1 second between requests
      // This prevents hitting OpenAI rate limits
      await sleep(1000);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total symptoms: ${symptoms.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`⏭️  Skipped (cached): ${skippedCount}`);
  console.log('\n🎉 Done! All symptoms now have triage questions.');

  // Estimated cost
  const estimatedCost = failureCount * 0.06; // $0.06 per new generation
  console.log(`\n💰 Estimated cost: $${estimatedCost.toFixed(2)}`);
}

// Run the script
main().catch(console.error);
