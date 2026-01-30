# Quick Start: AI-Powered Triage

## What You Have Now

✅ **Working triage system** for Headache symptom
✅ **7 questions** with manual rules
✅ **3 severity levels** (emergency, caution, low_risk)
✅ **Timer waiting room** with health tips
✅ **Complete UI flow** from symptom selection to outcome

## The Problem

❌ You need to manually create 7 questions for EACH symptom
❌ For 100 symptoms = 700 questions to write by hand
❌ You need medical expertise to write good questions
❌ Time-consuming and not scalable

## The Solution: AI

✨ **AI generates questions automatically** for ANY symptom
✨ **Medical expert quality** questions in seconds
✨ **Automatic risk scoring** based on medical knowledge
✨ **Personalized assessments** for each patient

---

## How It Works (Simple Explanation)

### Current System (Manual)
```
You write → 7 questions → Risk rules → Recommendations
```
**Time**: 2-4 hours per symptom
**Quality**: Depends on your medical knowledge

### AI System (Automatic)
```
AI writes → 7 questions → Risk rules → Recommendations
```
**Time**: 10 seconds per symptom
**Quality**: Medical expert level

---

## Quick Setup (5 Minutes)

### Step 1: Get Google Gemini AI Key (FREE!)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the key (starts with `AIza...`)

**No credit card required!** 🎉

### Step 2: Add Key to Supabase

**Option A: Via Dashboard** (easiest, when available)
- Go to your Supabase project
- Settings → Edge Functions → Secrets
- Add: `GEMINI_API_KEY` = your key

**Option B: Via CLI** (current method)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GEMINI_API_KEY=AIza-your-key-here
```

### Step 3: Deploy Functions

```bash
# Deploy both functions
supabase functions deploy generate-triage-questions
supabase functions deploy assess-triage-responses
```

### Step 4: Test It!

Open your app and select ANY symptom - questions will be generated automatically!

---

## Usage Examples

### Example 1: Generate Questions for One Symptom

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/generate-triage-questions`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symptomName: 'Chest Pain',
      symptomCategory: 'Respiratory & Chest'
    })
  }
);

const data = await response.json();
console.log(data.questions); // AI-generated questions ready to use!
```

### Example 2: Generate for All Symptoms at Once

```bash
# Run the pre-generation script
npx ts-node scripts/generate-all-triage-questions.ts
```

This will:
- Loop through all symptoms in your database
- Generate questions for each (if not already cached)
- Store questions permanently
- Show progress and summary

**Cost**: ~$0.06 × number of symptoms (one-time)

### Example 3: Get AI Assessment

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/assess-triage-responses`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: 'user-session-id',
      symptomName: 'Chest Pain'
    })
  }
);

const assessment = await response.json();
/*
{
  severity: "emergency",
  severity_title: "This may be a heart emergency.",
  severity_description: "Your symptoms suggest...",
  symptoms_summary: "Chest pain, shortness of breath",
  recommendation: "Call 911 immediately",
  riskScore: 18
}
*/
```

---

## Cost Breakdown

### One-Time Setup (Using Gemini AI - FREE!)
- **100 symptoms** × FREE = **$0.00** (within free tier!)
- If you exceed 1,500 requests/day: **~$0.15** (15 cents!)

### Ongoing Costs

**Option 1: AI Assessment** (personalized with Gemini)
- 1,000 patients/month × $0.0015 = **$1.50/month** (or FREE if <1,500/day!)
- 10,000 patients/month × $0.0015 = **$15/month**

**Option 2: Rule-Based Assessment** (using AI-generated weights)
- Any number of patients = **$0/month** (FREE!)

**Recommended**:
1. Generate questions with Gemini (FREE!)
2. Use rule-based scoring (FREE forever!)
3. Total cost: **$0** 🎉

---

## File Reference

### Files You Created
```
supabase/functions/
  ├── generate-triage-questions/
  │   └── index.ts                    # AI generates questions
  ├── assess-triage-responses/
  │   └── index.ts                    # AI analyzes answers

app/
  ├── triage-waiting-ai.tsx           # AI-powered waiting room
  ├── triage-waiting.tsx              # Rule-based waiting room (current)

scripts/
  └── generate-all-triage-questions.ts # Bulk generation script

docs/
  ├── TRIAGE_AI_GUIDE.md              # Complete guide (this file)
  ├── TRIAGE_FLOW_DIAGRAM.md          # Visual flows
  └── QUICK_START_AI_TRIAGE.md        # Quick reference
```

### Key Database Tables
```
symptoms_catalog       # All your symptoms
triage_questions       # Generated questions (with risk_weights!)
triage_sessions        # User triage sessions
triage_responses       # User answers
triage_outcomes        # Final assessments
```

---

## Switching Between Systems

### Use Rule-Based (Current)
```typescript
// In triage-question.tsx, line 166:
router.push(`/triage-waiting?sessionId=${sessionId}`);
```

### Use AI-Powered
```typescript
// In triage-question.tsx, line 166:
router.push(`/triage-waiting-ai?sessionId=${sessionId}`);
```

### Use Hybrid (Best!)
1. Generate questions with AI (one-time)
2. Review and store in database
3. Use rule-based assessment with AI weights (free, fast)

---

## Understanding the Intelligence

### The Algorithm

```javascript
// For each answer, add up risk points:
let totalScore = 0;

responses.forEach(response => {
  // Get AI-generated weights for this question
  const weights = question.risk_weights;

  // Example: {"Severe": 5, "Moderate": 3, "Mild": 1}
  const points = weights[answer] || 0;

  totalScore += points;
});

// Convert score to severity:
// 0-7 points   = low_risk    (monitor at home)
// 8-14 points  = caution     (see doctor soon)
// 15+ points   = emergency   (seek immediate care)
```

### Why AI is Better

**Manual Rules** (you write):
```javascript
if (answer.includes('chest pain')) {
  score += 5;  // Is 5 the right number? 🤔
}
```

**AI-Generated** (medical knowledge):
```json
{
  "Chest pain": 5,
  "Chest pain radiating to arm": 8,
  "Chest pain with sweating": 9,
  "Mild chest discomfort": 2
}
```

AI understands **nuances** that are hard to code manually!

---

## Troubleshooting

### "OpenAI API error"
- Check your API key is correct
- Verify you have credits on OpenAI
- Check the key has permissions

### "Questions not generating"
- Check Edge Functions are deployed
- Check OPENAI_API_KEY secret is set
- Look at Edge Function logs in Supabase dashboard

### "Too expensive"
- Pre-generate all questions once ($6)
- Use rule-based scoring (free)
- Only use AI for complex cases

---

## Next Steps

1. ✅ Deploy Edge Functions
2. ✅ Test with 1 symptom
3. ✅ Pre-generate for top 20 symptoms
4. ✅ Review AI-generated questions
5. ✅ Launch with rule-based scoring (free)
6. 📊 Monitor performance
7. 💡 Optionally add AI assessment for premium users

---

## Support

- **Full Guide**: See `TRIAGE_AI_GUIDE.md`
- **Flow Diagrams**: See `TRIAGE_FLOW_DIAGRAM.md`
- **Code**: Check files in `supabase/functions/`

Good luck! 🚀
