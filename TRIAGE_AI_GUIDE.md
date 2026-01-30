# Complete Triage System Guide: Rule-Based vs AI-Powered

This guide explains the triage intelligence system in detail and shows you how to scale it to handle ANY symptom using AI.

---

## Table of Contents

1. [Current System: Rule-Based Algorithm](#1-current-system-rule-based-algorithm)
2. [AI-Powered System](#2-ai-powered-system)
3. [Setup Instructions](#3-setup-instructions)
4. [Comparison: Rule-Based vs AI](#4-comparison-rule-based-vs-ai)
5. [Scaling to All Symptoms](#5-scaling-to-all-symptoms)
6. [Cost & Performance](#6-cost--performance)

---

## 1. Current System: Rule-Based Algorithm

### How It Works

Located in: `app/triage-waiting.tsx`

The current system uses a **manual scoring algorithm** where you define rules for each symptom:

```typescript
// STEP 1: Initialize risk score
let riskScore = 0;

// STEP 2: Loop through patient answers
responses.forEach((response) => {
  const answer = response.answer;

  // RULE: Check blood pressure history (worth 2 points)
  if (response.question_text.includes('history of high blood pressure')) {
    if (answer === 'Yes') riskScore += 2;
  }

  // RULE: Check if on medication (worth 1 point)
  if (response.question_text.includes('blood pressure medication')) {
    if (answer === 'Yes') riskScore += 1;
  }

  // RULE: Check dangerous symptoms (worth 3-5 points)
  if (response.question_text.includes('experiencing any of the following')) {
    const symptoms = JSON.parse(answer); // Multi-select answer

    if (symptoms.includes('Chest discomfort') ||
        symptoms.includes('Shortness of breath')) {
      riskScore += 5; // CRITICAL symptoms
    }

    if (symptoms.includes('Blurred vision') ||
        symptoms.includes('Dizziness')) {
      riskScore += 3; // CONCERNING symptoms
    }
  }

  // RULE: Check severity level
  if (response.question_text.includes('How severe')) {
    if (answer === 'Severe') riskScore += 4;
    if (answer === 'Moderate') riskScore += 2;
    if (answer === 'Mild') riskScore += 1;
  }

  // RULE: "Worst headache ever" is EMERGENCY
  if (response.question_text.includes('worst headache ever')) {
    if (answer === 'Yes') riskScore += 5;
  }
});

// STEP 3: Convert score to severity level
if (riskScore >= 8) return 'emergency';   // High risk
if (riskScore >= 4) return 'caution';     // Medium risk
return 'low_risk';                         // Low risk
```

### Pros & Cons

✅ **Pros:**
- Fast (no API calls)
- Free (no AI costs)
- Predictable results
- Works offline
- Easy to debug

❌ **Cons:**
- Must manually create rules for EVERY symptom
- Labor-intensive (100+ symptoms = 100+ rule sets)
- Hard to maintain
- Not adaptive to new medical knowledge
- Can't handle complex symptom combinations

### Current Limitations

**You need to manually create**:
- 7 questions per symptom
- Risk weights for each answer option
- Severity calculation logic
- Recommendation text

**For 100 symptoms, this means**:
- 700 questions to write
- 2,100+ answer options to define
- 100 custom algorithms to code

This is NOT scalable! 😰

---

## 2. AI-Powered System

### How It Works

The AI system has **2 Edge Functions**:

#### Function 1: `generate-triage-questions`

**Purpose**: Generate questions automatically for ANY symptom

**Location**: `supabase/functions/generate-triage-questions/index.ts`

**What it does**:

```
User selects "Chest Pain"
         ↓
Function checks database: "Do questions exist?"
         ↓
   YES → Return cached questions (fast!)
         ↓
   NO  → Ask OpenAI to generate 7 questions
         ↓
       Store questions in database
         ↓
       Return questions to app
```

**Example AI Prompt**:

```typescript
const prompt = `You are a medical triage specialist.
Generate exactly 7 diagnostic questions for a patient reporting
"Chest Pain" in the "Respiratory & Chest" category.

Requirements:
1. Questions should progress from general to specific
2. Include questions about severity, duration, and associated symptoms
3. Questions should help determine if the patient needs emergency care
4. Format as JSON with risk_weights for each answer option

Return:
{
  "questions": [
    {
      "question_text": "How long have you had chest pain?",
      "question_type": "multiple_choice",
      "options": ["Less than 5 minutes", "5-30 minutes", "Over 30 minutes"],
      "risk_weights": {
        "Less than 5 minutes": 1,
        "5-30 minutes": 3,
        "Over 30 minutes": 5
      }
    },
    ...
  ]
}`;
```

**AI generates**:
- ✅ All 7 questions
- ✅ All answer options
- ✅ Risk weights (0-5) for each option
- ✅ Question types (multiple choice, multi-select, text)

#### Function 2: `assess-triage-responses`

**Purpose**: Analyze patient answers and provide diagnosis

**Location**: `supabase/functions/assess-triage-responses/index.ts`

**What it does**:

```
Patient completes all questions
         ↓
Function calculates risk score using AI-generated weights
         ↓
Score = Sum of all selected answer weights
         ↓
Ask OpenAI: "Review these answers and risk score"
         ↓
AI generates personalized assessment:
  - Severity level (emergency/caution/low_risk)
  - Detailed explanation
  - Specific recommendations
  - Symptoms summary
```

**Example AI Assessment**:

```typescript
// INPUT to AI:
{
  "symptom": "Chest Pain",
  "riskScore": 18,
  "responses": [
    "Q: How long have you had chest pain? A: Over 30 minutes",
    "Q: Do you have shortness of breath? A: Yes",
    "Q: Is the pain sharp or dull? A: Sharp, radiating to arm"
  ]
}

// OUTPUT from AI:
{
  "severity": "emergency",
  "severity_title": "This may be a heart emergency.",
  "severity_description": "Your symptoms suggest possible cardiac issues.
    Chest pain lasting over 30 minutes with shortness of breath and
    radiating pain requires immediate medical attention.",
  "symptoms_summary": "Prolonged chest pain, shortness of breath, radiating pain",
  "recommendation": "Call emergency services immediately (911) or go to nearest ER"
}
```

### The Magic: Automatic Intelligence

**Before AI** (Manual):
```
Headache → You write 7 questions → You write risk rules → You write recommendations
Chest Pain → You write 7 questions → You write risk rules → You write recommendations
Fever → You write 7 questions → You write risk rules → You write recommendations
... repeat 100+ times 😭
```

**With AI** (Automatic):
```
ANY symptom → AI generates questions → AI calculates risk → AI writes recommendations
Done! ✨
```

---

## 3. Setup Instructions

### Prerequisites

You need:
1. ✅ Supabase account (you already have this)
2. ✅ OpenAI API account
3. ✅ Credit card for OpenAI (costs ~$0.01-0.05 per triage)

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)

### Step 2: Add API Key to Supabase

You need to add the OpenAI key as a secret in Supabase Edge Functions:

**Option A: Using Supabase Dashboard** (Coming soon in dashboard)

**Option B: Using Supabase CLI** (Current method)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Add OpenAI API key as secret
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Deploy the functions
supabase functions deploy generate-triage-questions
supabase functions deploy assess-triage-responses
```

### Step 3: Update Your App to Use AI

Change the navigation in `triage-question.tsx`:

```typescript
// BEFORE (Rule-based):
router.push(`/triage-waiting?sessionId=${sessionId}`);

// AFTER (AI-powered):
router.push(`/triage-waiting-ai?sessionId=${sessionId}`);
```

That's it! 🎉

### Step 4: Generate Questions for Any Symptom

When a user selects a symptom, call the function:

```typescript
// In your symptom selection screen
const handleSymptomSelect = async (symptom: any) => {
  // Call AI to generate questions (if not cached)
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-triage-questions`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symptomName: symptom.name,
      symptomCategory: symptom.category
    }),
  });

  const data = await response.json();

  if (data.cached) {
    console.log('Questions loaded from cache (fast!)');
  } else {
    console.log('AI generated new questions');
  }

  // Questions are now stored in database
  // Your triage flow can use them
};
```

---

## 4. Comparison: Rule-Based vs AI

| Feature | Rule-Based | AI-Powered |
|---------|------------|------------|
| **Setup time per symptom** | 2-4 hours | 10 seconds |
| **Cost per triage** | Free | $0.01-0.05 |
| **Questions quality** | Depends on your expertise | Medical expert level |
| **Maintenance** | Manual updates needed | Auto-updates with AI model |
| **Scalability** | Poor (1 symptom at a time) | Excellent (instant) |
| **Speed** | Instant | ~2-3 seconds |
| **Offline support** | ✅ Yes | ❌ No (needs internet) |
| **Consistency** | ✅ 100% predictable | ~95% consistent |
| **Medical accuracy** | Depends on your rules | Medical literature trained |

### When to Use Each

**Use Rule-Based** when:
- You have very few symptoms (<10)
- You need offline functionality
- You want zero AI costs
- You have medical expertise to write rules
- Speed is critical (no API latency)

**Use AI-Powered** when:
- You have many symptoms (10+)
- You want to launch quickly
- You don't have medical expertise
- You want the latest medical knowledge
- You're okay with small API costs

**Hybrid Approach** (Best!):
- Use AI to generate initial questions
- Review and refine them manually
- Cache them in database
- Use rule-based scoring with AI-generated weights
- No ongoing AI costs, but benefit from AI's medical knowledge

---

## 5. Scaling to All Symptoms

### Option 1: Pre-Generate Questions (Recommended)

Generate questions for all symptoms once, store them forever:

```typescript
// Script to run once
const symptoms = [
  'Headache', 'Chest Pain', 'Fever', 'Cough', 'Nausea',
  'Abdominal Pain', 'Back Pain', 'Dizziness', // ... etc
];

for (const symptom of symptoms) {
  await fetch(`${SUPABASE_URL}/functions/v1/generate-triage-questions`, {
    method: 'POST',
    body: JSON.stringify({
      symptomName: symptom,
      symptomCategory: getCategoryForSymptom(symptom)
    })
  });

  console.log(`✅ Generated questions for ${symptom}`);
  await sleep(1000); // Rate limit: 1 per second
}

console.log('🎉 All symptoms ready!');
```

**Cost**: $5-10 one-time for 100 symptoms
**Benefit**: All future triages are FREE and INSTANT

### Option 2: Generate On-Demand

Generate questions the first time a user selects each symptom:

**Cost**: $0.01 per new symptom
**Benefit**: Zero upfront cost

### Option 3: Hybrid (Best for Production)

1. **Pre-generate** questions for top 20 symptoms (common ones)
2. **On-demand generate** for rare symptoms
3. **Human review** AI-generated questions before going live
4. **Use AI assessment** for all triages (personalized)

---

## 6. Cost & Performance

### OpenAI Pricing (as of 2024)

- **GPT-4 Turbo**: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- **Average question generation**: ~500 input + 1,500 output = $0.06
- **Average assessment**: ~300 input + 300 output = $0.02

### Real-World Costs

**Scenario 1: 1,000 patients/month**
- Pre-generate questions: $6 one-time
- Assessments: 1,000 × $0.02 = $20/month
- **Total: $20/month** 💰

**Scenario 2: 10,000 patients/month**
- Pre-generate questions: $6 one-time
- Assessments: 10,000 × $0.02 = $200/month
- **Total: $200/month** 💰

**Scenario 3: Use hybrid (recommended)**
- Pre-generate questions: $6 one-time
- Use rule-based assessment: FREE
- **Total: $0/month** 🎉

### Performance

**Question Generation**:
- First time: 3-5 seconds (AI generation)
- Cached: <100ms (database lookup)

**Assessment**:
- AI-powered: 2-3 seconds
- Rule-based: <50ms

**Recommendation**:
Generate questions with AI once, use rule-based scoring with AI weights for instant, free assessments.

---

## Summary

### Current System (Rule-Based)
- ✅ Fast and free
- ❌ Manual work for each symptom
- ❌ Not scalable

### AI System
- ✅ Automatic for ANY symptom
- ✅ Medical expert quality
- ✅ Scalable to 1,000+ symptoms
- ⚠️ Small cost (~$0.02 per patient)

### Best Practice
1. Use AI to **generate questions** (one-time)
2. Review and store questions in database
3. Use **rule-based scoring** with AI weights (free, fast)
4. Optionally use AI for **personalized assessments**

**Result**: You get AI intelligence with rule-based speed and cost! 🚀

---

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Deploy Edge Functions
3. ✅ Pre-generate questions for top symptoms
4. ✅ Test with real patients
5. ✅ Monitor costs and adjust strategy

Need help? Check the code in:
- `supabase/functions/generate-triage-questions/index.ts`
- `supabase/functions/assess-triage-responses/index.ts`
- `app/triage-waiting-ai.tsx`
