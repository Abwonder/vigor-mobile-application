# AI-Powered Triage System Documentation

## 🎯 Quick Links

- **New here?** → Start with [Gemini AI Setup Guide](GEMINI_AI_SETUP.md)
- **Want details?** → Read the [Complete Guide](TRIAGE_AI_GUIDE.md)
- **Need visuals?** → Check the [Flow Diagrams](TRIAGE_FLOW_DIAGRAM.md)
- **Quick reference?** → See [Quick Start](QUICK_START_AI_TRIAGE.md)
- **Why Gemini?** → Read [AI Comparison](AI_COMPARISON.md)

---

## 📚 Documentation Overview

### 1. [GEMINI_AI_SETUP.md](GEMINI_AI_SETUP.md) ⭐ START HERE

**What it covers**:
- Why Google Gemini AI is the best choice
- Step-by-step setup (5 minutes)
- Free tier details
- Cost comparison
- Testing and troubleshooting

**Perfect for**: First-time setup, getting started

**Time to read**: 10 minutes

---

### 2. [TRIAGE_AI_GUIDE.md](TRIAGE_AI_GUIDE.md)

**What it covers**:
- How the rule-based algorithm works (in detail)
- How the AI system works (technical deep dive)
- Setup instructions for both approaches
- Scaling strategies
- Cost analysis
- Best practices

**Perfect for**: Understanding the system deeply, developers

**Time to read**: 30 minutes

---

### 3. [TRIAGE_FLOW_DIAGRAM.md](TRIAGE_FLOW_DIAGRAM.md)

**What it covers**:
- Visual flowcharts of user journey
- Algorithm comparison diagrams
- Database structure diagrams
- Integration architecture

**Perfect for**: Visual learners, architects, understanding data flow

**Time to read**: 15 minutes

---

### 4. [QUICK_START_AI_TRIAGE.md](QUICK_START_AI_TRIAGE.md)

**What it covers**:
- 5-minute setup guide
- Code examples
- Common use cases
- Troubleshooting
- Cost breakdown

**Perfect for**: Quick reference, experienced developers

**Time to read**: 5 minutes

---

### 5. [AI_COMPARISON.md](AI_COMPARISON.md)

**What it covers**:
- Google Gemini vs OpenAI comparison
- Detailed cost analysis
- Performance benchmarks
- Quality comparison
- When to use each

**Perfect for**: Decision makers, understanding why we chose Gemini

**Time to read**: 15 minutes

---

## 🚀 Getting Started (3 Steps)

### Step 1: Get Gemini API Key (2 minutes)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your key (starts with `AIza...`)

**No credit card required!** 🎉

### Step 2: Deploy to Supabase (2 minutes)

```bash
# Add your key
supabase secrets set GEMINI_API_KEY=your-key-here

# Deploy functions
supabase functions deploy generate-triage-questions
supabase functions deploy assess-triage-responses
```

### Step 3: Pre-Generate Questions (1 minute)

```bash
# Generate questions for all symptoms
npx ts-node scripts/generate-all-triage-questions.ts
```

**Done!** Your AI-powered triage system is ready! 🎉

---

## 💰 Cost Summary

### Google Gemini AI (What We Use)

**Free Tier**:
- 1,500 requests per day
- 60 requests per minute
- Perfect for small-medium clinics

**Paid Tier** (when you exceed free):
- $0.0015 per triage (~0.15 cents)
- 100 patients/day = **FREE**
- 1,000 patients/day = **FREE**
- 10,000 patients/day = **$15/month**

**Our Recommendation**:
1. Pre-generate questions (FREE)
2. Use rule-based scoring (FREE)
3. Total cost: **$0/month** 🎉

---

## 📁 File Structure

```
project/
├── supabase/
│   └── functions/
│       ├── generate-triage-questions/
│       │   └── index.ts              # AI generates questions
│       └── assess-triage-responses/
│           └── index.ts              # AI analyzes answers
│
├── app/
│   ├── triage-question.tsx           # Question flow screen
│   ├── triage-waiting.tsx            # Rule-based waiting room
│   ├── triage-waiting-ai.tsx         # AI-powered waiting room
│   └── triage-outcome.tsx            # Results screen
│
├── scripts/
│   └── generate-all-triage-questions.ts  # Bulk generation
│
└── docs/
    ├── GEMINI_AI_SETUP.md            # ⭐ Start here
    ├── TRIAGE_AI_GUIDE.md            # Complete guide
    ├── TRIAGE_FLOW_DIAGRAM.md        # Visual flows
    ├── QUICK_START_AI_TRIAGE.md      # Quick reference
    ├── AI_COMPARISON.md              # Gemini vs OpenAI
    └── AI_TRIAGE_README.md           # This file
```

---

## 🎓 Learning Path

### Beginner (Never used AI APIs before)

1. Read [Gemini AI Setup](GEMINI_AI_SETUP.md) - Get API key, deploy
2. Test with one symptom in your app
3. Check [Quick Start](QUICK_START_AI_TRIAGE.md) for examples

**Time**: 30 minutes

### Intermediate (Have basic understanding)

1. Skim [Gemini AI Setup](GEMINI_AI_SETUP.md) - Just the setup steps
2. Read [Complete Guide](TRIAGE_AI_GUIDE.md) - Understand the system
3. Look at [Flow Diagrams](TRIAGE_FLOW_DIAGRAM.md) - See data flow
4. Pre-generate all questions

**Time**: 1 hour

### Advanced (Want to customize everything)

1. Read all documentation
2. Review Edge Function code
3. Customize prompts and risk weights
4. Set up monitoring and alerts
5. Implement hybrid strategies

**Time**: 2-3 hours

---

## 🔄 Two Approaches You Can Use

### Approach 1: Rule-Based (Current, FREE Forever)

**How it works**:
- AI generates questions once (FREE)
- Questions stored in database (cached)
- Risk scoring uses hardcoded rules
- **Cost**: $0

**Best for**:
- Budget-conscious
- Need offline support
- Want predictable behavior
- Small-medium volume

**Files**: `triage-waiting.tsx`

---

### Approach 2: AI-Powered (New, Personalized)

**How it works**:
- AI generates questions once (FREE)
- Questions stored in database (cached)
- AI analyzes each response (personalized)
- **Cost**: FREE within limits, or $0.0015/patient

**Best for**:
- Want personalized recommendations
- Need AI to spot complex patterns
- Have internet connection
- Can afford small costs

**Files**: `triage-waiting-ai.tsx`

---

### Approach 3: Hybrid (BEST!)

**How it works**:
- AI generates questions once (FREE)
- Questions stored in database (cached)
- Rule-based for standard cases (FREE)
- AI-powered for complex/premium users (small cost)

**Best for**:
- Want best of both worlds
- Optimize for cost AND quality
- Different tiers of service

**Setup**:
```typescript
// In your code, choose based on user type
if (user.isPremium || symptomIsComplex) {
  router.push(`/triage-waiting-ai?sessionId=${sessionId}`);
} else {
  router.push(`/triage-waiting?sessionId=${sessionId}`);
}
```

---

## ⚡ Performance Benchmarks

### Question Generation

| Method | First Time | Cached | Cost |
|--------|-----------|--------|------|
| **Gemini AI** | 1-2 sec | <0.1 sec | FREE |
| Manual | N/A | <0.1 sec | Your time |

### Assessment

| Method | Time | Cost per Patient |
|--------|------|-----------------|
| **Rule-Based** | <0.05 sec | $0 |
| **Gemini AI** | 1-2 sec | FREE or $0.0015 |

---

## 🛠️ Troubleshooting

### Common Issues

**"API key not configured"**
→ Solution: Check [Gemini Setup Guide](GEMINI_AI_SETUP.md#step-2-add-key-to-supabase)

**"Questions not generating"**
→ Solution: Check [Troubleshooting section](GEMINI_AI_SETUP.md#troubleshooting)

**"Costs too high"**
→ Solution: Use hybrid approach, pre-generate questions

**"Need faster responses"**
→ Solution: Use rule-based scoring instead of AI assessment

---

## 📊 Success Metrics

Track these to measure success:

1. **Question Quality**: Review AI-generated questions
2. **Assessment Accuracy**: Compare AI vs manual triage
3. **Cost**: Monitor Gemini API usage
4. **Speed**: Measure response times
5. **User Satisfaction**: Patient feedback on triage experience

---

## 🤝 Support

- **Setup help**: See [Gemini AI Setup Guide](GEMINI_AI_SETUP.md)
- **Technical questions**: See [Complete Guide](TRIAGE_AI_GUIDE.md)
- **Visual understanding**: See [Flow Diagrams](TRIAGE_FLOW_DIAGRAM.md)
- **Quick answers**: See [Quick Start](QUICK_START_AI_TRIAGE.md)

---

## 🎯 Next Steps

1. ✅ Read [Gemini AI Setup Guide](GEMINI_AI_SETUP.md)
2. ✅ Get your Gemini API key (FREE!)
3. ✅ Deploy Edge Functions
4. ✅ Pre-generate questions
5. ✅ Test with real symptoms
6. ✅ Launch! 🚀

---

## 📈 Roadmap

### Already Implemented ✅
- Rule-based triage algorithm
- AI question generation (Gemini)
- AI assessment (Gemini)
- Pre-generation script
- Complete documentation
- Cost optimization

### Possible Future Enhancements 💡
- Multi-language support
- Voice input for questions
- Image analysis (Gemini Vision)
- Integration with EHR systems
- Real-time nurse consultation
- Advanced analytics dashboard

---

**Ready to get started?**

👉 [Go to Gemini AI Setup Guide](GEMINI_AI_SETUP.md)

Good luck! 🚀
