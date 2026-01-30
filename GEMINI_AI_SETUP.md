# Google Gemini AI Setup for Triage System

## Why Gemini AI? 🎯

✅ **FREE tier** - 60 requests/minute (enough for most apps!)
✅ **No credit card required** to start
✅ **75% cheaper** than OpenAI when you scale
✅ **Fast responses** (~1-2 seconds)
✅ **Excellent medical knowledge** (trained on medical literature)
✅ **JSON mode built-in** (perfect for structured data)

---

## Cost Comparison

### Google Gemini AI (What We're Using)

**FREE Tier**:
- 60 requests per minute
- 1,500 requests per day
- Perfect for testing and small-scale apps

**Paid Tier** (when you exceed free limits):
- $0.00025 per 1K input tokens
- $0.0005 per 1K output tokens
- **Average cost per triage**: ~$0.0015 (0.15 cents!)

### OpenAI (Alternative)

**No free tier** - Need credit card from day 1

**Paid**:
- $0.01 per 1K input tokens
- $0.03 per 1K output tokens
- **Average cost per triage**: ~$0.02 (2 cents)

**Gemini is ~13x cheaper!** 💰

---

## Quick Setup (5 Minutes)

### Step 1: Get Gemini API Key

1. Go to **https://makersuite.google.com/app/apikey**

2. Click **"Get API Key"** or **"Create API Key"**

3. Select your Google Cloud project (or create a new one)

4. Copy your API key (starts with `AIza...`)

**Important**: Keep this key secret! Don't share it or commit it to GitHub.

### Step 2: Add Key to Supabase

**Option A: Using Supabase CLI** (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (find project ref in Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Add Gemini API key as secret
supabase secrets set GEMINI_API_KEY=AIza...your-key-here
```

**Option B: Using Supabase Dashboard** (When available)

1. Go to your Supabase project
2. Navigate to: **Settings** → **Edge Functions** → **Secrets**
3. Add new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your API key

### Step 3: Deploy Edge Functions

```bash
# Deploy both functions
supabase functions deploy generate-triage-questions
supabase functions deploy assess-triage-responses
```

You should see:
```
✓ Deployed function generate-triage-questions
✓ Deployed function assess-triage-responses
```

### Step 4: Test It!

Run the pre-generation script to test:

```bash
npx ts-node scripts/generate-all-triage-questions.ts
```

Or test with a single symptom in your app:
1. Open the app
2. Click "Find Care"
3. Select any symptom
4. Questions should be generated automatically!

---

## How Gemini Integration Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR APP                                │
│  User selects symptom → "Chest Pain"                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                          │
│  Check: Do questions exist in database?                     │
│    YES → Return cached questions (instant!)                 │
│    NO  → Continue to Gemini...                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 GOOGLE GEMINI API                            │
│  Model: gemini-1.5-flash (fast & free!)                     │
│  Request: "Generate 7 triage questions for Chest Pain"      │
│  Response: JSON with questions + risk weights               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE                               │
│  Store questions for future use (cached forever)            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      YOUR APP                                │
│  Display questions to user                                   │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints

The code uses Gemini's REST API:

```typescript
// Generate questions
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY

// Request body
{
  "contents": [{
    "parts": [{
      "text": "Your prompt here"
    }]
  }],
  "generationConfig": {
    "temperature": 0.3,
    "responseMimeType": "application/json"
  }
}
```

---

## Models Available

### Gemini 1.5 Flash (Recommended - What we use)

- ⚡ **Fastest** responses
- 💰 **Cheapest** option
- 🆓 **Free tier** available
- ✅ **Good quality** for triage questions
- Use for: Question generation, assessments

### Gemini 1.5 Pro (Alternative)

- 🧠 **Highest quality** responses
- 💰 More expensive
- ❌ **No free tier**
- ✅ **Best medical accuracy**
- Use for: Complex cases, second opinions

**Our recommendation**: Start with Flash. It's free and excellent quality!

---

## Usage Limits

### Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per request**

### What This Means for Your App

**Scenario 1: Small clinic (100 patients/day)**
- Each patient = 2 requests (generate questions + assessment)
- Total: 200 requests/day
- ✅ **Completely FREE!**

**Scenario 2: Medium clinic (500 patients/day)**
- Total: 1,000 requests/day
- ✅ **Still FREE!**

**Scenario 3: Large clinic (1,000+ patients/day)**
- Total: 2,000+ requests/day
- First 1,500 requests: FREE
- Remaining 500 requests: 500 × $0.0015 = **$0.75/day**
- Monthly cost: ~$22/month

**Strategy**: Pre-generate questions for all symptoms (one-time, uses ~200 requests). Then only use Gemini for assessments if needed!

---

## Pre-Generation Strategy (Best Practice)

To minimize ongoing costs and maximize speed:

### Step 1: Pre-Generate All Questions (One-Time)

```bash
# This runs once and caches all questions
npx ts-node scripts/generate-all-triage-questions.ts
```

**What happens**:
- Generates questions for all 100+ symptoms
- Stores them permanently in database
- Cost: FREE (uses ~100-200 requests, well within free tier)
- Time: 2-3 minutes

**After this**: All future patients get instant questions from cache!

### Step 2: Choose Assessment Method

**Option A: Rule-Based (FREE forever)**
```typescript
// Uses Gemini-generated risk weights, but no ongoing API calls
router.push(`/triage-waiting?sessionId=${sessionId}`);
```
- Cost: $0
- Speed: Instant
- Quality: Excellent (uses Gemini's weights)

**Option B: AI Assessment (Personalized)**
```typescript
// Calls Gemini for personalized assessment
router.push(`/triage-waiting-ai?sessionId=${sessionId}`);
```
- Cost: $0.0015 per patient (or FREE within daily limits)
- Speed: 2 seconds
- Quality: Personalized explanations

**Recommendation**: Use Option A for most patients, Option B for VIP/premium users!

---

## Testing & Debugging

### Test Question Generation

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-triage-questions \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "symptomName": "Headache",
    "symptomCategory": "General Symptoms"
  }'
```

Expected response:
```json
{
  "questions": [
    {
      "question_text": "How long have you had the headache?",
      "question_type": "multiple_choice",
      "options": ["Less than 1 hour", "1-6 hours", "More than 6 hours"],
      "risk_weights": {
        "Less than 1 hour": 1,
        "1-6 hours": 2,
        "More than 6 hours": 3
      }
    }
    // ... 6 more questions
  ],
  "cached": false,
  "message": "Questions generated by AI"
}
```

### Test Assessment

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/assess-triage-responses \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "symptomName": "Headache"
  }'
```

### Check Logs

View Edge Function logs in Supabase Dashboard:
1. Go to **Edge Functions** section
2. Click on a function
3. View **Logs** tab
4. Look for errors or API responses

---

## Troubleshooting

### Error: "Gemini API key not configured"

**Solution**:
```bash
# Make sure you set the secret
supabase secrets set GEMINI_API_KEY=AIza...

# Verify it was set
supabase secrets list
```

### Error: "API key not valid"

**Solution**:
1. Check your key at https://makersuite.google.com/app/apikey
2. Make sure you copied the entire key
3. Try generating a new key

### Error: "Quota exceeded"

**Solution**:
- You've hit the free tier limit (1,500/day)
- Wait until tomorrow, or
- Enable billing in Google Cloud Console
- Consider pre-generating all questions to avoid this

### Questions Look Weird/Bad Quality

**Solution**:
1. Check the prompt in the Edge Function
2. Adjust temperature (0.1 = more consistent, 0.5 = more creative)
3. Try Gemini 1.5 Pro instead of Flash

### Slow Response Times

**Solution**:
- Pre-generate questions (eliminates AI calls)
- Use rule-based assessment instead of AI assessment
- Check your internet connection
- Verify Supabase Edge Function region (should be close to users)

---

## Migration from OpenAI (If You Started There)

If you previously set up OpenAI, here's how to switch:

### Step 1: Remove OpenAI Secret

```bash
supabase secrets unset OPENAI_API_KEY
```

### Step 2: Add Gemini Secret

```bash
supabase secrets set GEMINI_API_KEY=AIza...
```

### Step 3: Redeploy Functions

```bash
supabase functions deploy generate-triage-questions
supabase functions deploy assess-triage-responses
```

### Step 4: Test

The functions will now use Gemini instead of OpenAI automatically!

---

## Advanced: Custom Configuration

### Adjust Response Quality

Edit `supabase/functions/generate-triage-questions/index.ts`:

```typescript
generationConfig: {
  temperature: 0.3,      // Lower = more consistent (0.1-0.5)
  topK: 40,              // Sampling parameter (20-100)
  topP: 0.95,            // Nucleus sampling (0.8-1.0)
  maxOutputTokens: 2048, // Max response length
  responseMimeType: 'application/json',
}
```

### Use Different Model

Replace `gemini-1.5-flash` with:
- `gemini-1.5-pro` - Higher quality, slower, more expensive
- `gemini-1.0-pro` - Older model, similar to Flash

### Add Safety Settings

```typescript
safetySettings: [
  {
    category: 'HARM_CATEGORY_MEDICAL',
    threshold: 'BLOCK_ONLY_HIGH'
  }
]
```

---

## Monitoring Usage

### Check Your Usage

1. Go to https://makersuite.google.com/
2. Click on your project
3. View **Usage & billing** tab

You'll see:
- Requests per day
- Tokens used
- Cost (if on paid tier)

### Set Up Alerts

In Google Cloud Console:
1. Go to **Billing** → **Budgets & alerts**
2. Create alert for when you exceed free tier
3. Get email when approaching limits

---

## Production Checklist

Before launching with Gemini AI:

- [ ] API key is set as Supabase secret
- [ ] Edge Functions deployed successfully
- [ ] Pre-generated questions for top 20-50 symptoms
- [ ] Tested with real symptom data
- [ ] Decided on assessment strategy (rule-based vs AI)
- [ ] Set up usage monitoring
- [ ] Configured budget alerts (if using paid tier)
- [ ] Reviewed and approved AI-generated questions
- [ ] Tested error handling and fallbacks
- [ ] Documented for your team

---

## Summary

**What You Get**:
- ✅ FREE AI-powered triage for most use cases
- ✅ Professional medical-grade questions
- ✅ Automatic question generation for ANY symptom
- ✅ Personalized assessments (optional)
- ✅ 13x cheaper than OpenAI when you scale

**Next Steps**:
1. Get Gemini API key (5 minutes)
2. Deploy Edge Functions (1 minute)
3. Pre-generate questions (2 minutes)
4. Launch! 🚀

Need help? Check the full guide in `TRIAGE_AI_GUIDE.md` or ask me!
