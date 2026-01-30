# Hybrid Triage System

## Overview

Your triage system now uses a **hybrid approach** that combines pre-generated questions with real-time AI generation. This provides the best of both worlds:

- **Fast responses** for common symptoms (cached in database)
- **AI-powered generation** for new/rare symptoms
- **Smart assessment** that uses rule-based scoring for most patients and AI for complex cases
- **Auto-learning** that grows smarter over time

---

## System Architecture

### 1. Question Generation (Hybrid)

```
User Searches Symptom
         ↓
    Is it cached?
    ↙         ↘
  YES          NO
   ↓            ↓
Return       Generate
Instant      with AI
(<100ms)    (2-3 sec)
   ↓            ↓
   └────→ Cache ←┘
          for next
          patient
```

**Result**: First patient waits 2 seconds, all future patients get instant responses.

### 2. Assessment Scoring (Hybrid)

```
Patient Completes Questions
         ↓
Calculate Risk Score (0-35)
         ↓
    Decision Logic
    ↙     ↓      ↘
Premium  Border  Standard
User     line    Case
 ↓       ↓       ↓
AI      AI     Rule
(10%)   (5%)   Based
                (85%)
```

**Cost Optimization**: ~95% of triages are FREE (rule-based), only premium/complex cases use AI.

---

## Key Features

### Auto-Learning Database

When a patient searches for a symptom not in your database:

1. ✅ AI generates 7 diagnostic questions
2. ✅ Saves to database automatically
3. ✅ Next patient gets instant cached version
4. ✅ No manual intervention needed

**Example**:
- Patient 1 searches "Chest tightness" → AI generates (2 sec)
- Patient 2 searches "Chest tightness" → Instant (<100ms)
- Database grows from 69 → 70 symptoms automatically

### Smart Assessment Logic

The system automatically chooses between rule-based and AI assessment:

**Uses AI Assessment (10% of cases)**:
- Premium/VIP subscribers (personalized care)
- Borderline risk scores (7-10 points)
- Complex multi-symptom cases (>10 questions)

**Uses Rule-Based (90% of cases)**:
- Clear emergency cases (15+ points)
- Standard moderate cases (8-14 points)
- Low-risk cases (0-7 points)

### Performance Tracking

All assessments are tracked in the database:

```sql
SELECT
  assessment_method,
  COUNT(*) as total,
  AVG(processing_time_ms) as avg_time,
  AVG(risk_score) as avg_risk
FROM triage_sessions
GROUP BY assessment_method;
```

Expected results:
- `rule_based`: ~90% of cases, <100ms
- `ai_powered`: ~10% of cases, 2-3 seconds

---

## Setup Instructions

### 1. Pre-Generate Questions (One-Time)

Generate questions for the top 80% of common symptoms:

```bash
npm run pre-generate
```

This will:
- Process 55 most common symptoms
- Generate 7 questions per symptom (385 total questions)
- Takes ~2-3 minutes to complete
- Shows progress bar and completion statistics

**Output Example**:
```
🚀 Starting Pre-Generation of Triage Questions
📊 Target: Top 80% of symptoms (55 out of 69)

[100%] Processing: Anxiety                          ✓ (1840ms)

======================================================================
📈 PRE-GENERATION COMPLETE
======================================================================
Total Processed:    55
Already Cached:     1
Newly Generated:    54
Failed:             0
======================================================================

✅ System Ready for Production!
   - 55 symptoms have instant responses (<100ms)
   - Remaining symptoms will generate on-demand (2-3 seconds)
   - AI costs optimized: ~95% of triages will be FREE

🎯 Success Rate: 100.0%
```

### 2. Monitor System Performance

View analytics dashboard:

```sql
SELECT * FROM triage_analytics
ORDER BY date DESC
LIMIT 30;
```

This shows:
- Daily triage volume
- Rule-based vs AI-powered split
- Average processing times
- Average risk scores

### 3. Check Symptom Coverage

See which symptoms have cached questions:

```sql
SELECT
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE questions_generated = true) as cached,
  ROUND(100.0 * COUNT(*) FILTER (WHERE questions_generated = true) / COUNT(*), 1) as coverage_pct
FROM symptoms_catalog
GROUP BY category
ORDER BY coverage_pct DESC;
```

---

## API Usage

### Generate Questions

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/generate-triage-questions`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symptomName: 'Headache',
      symptomCategory: 'General Symptoms'
    })
  }
);

const data = await response.json();

// Response includes:
// - questions: Array of question objects
// - cached: Boolean (true if from database)
// - processingTime: Number (milliseconds)
// - symptomId: UUID
```

### Assess Responses

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/assess-triage-responses`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: 'uuid',
      symptomName: 'Headache',
      userId: 'user-uuid' // Optional, for premium check
    })
  }
);

const data = await response.json();

// Response includes:
// - severity: 'emergency' | 'caution' | 'low_risk'
// - severity_title: String
// - severity_description: String
// - recommendation: String
// - riskScore: Number (0-35)
// - assessmentMethod: 'rule_based' | 'ai_powered'
// - processingTime: Number
```

---

## Cost Optimization

### Expected Cost Breakdown

**Question Generation**:
- Pre-generated (55 symptoms): FREE forever
- On-demand (14 symptoms): Small one-time cost per new symptom
- Future patients: FREE (cached)

**Assessment**:
- Rule-based (90%): FREE forever
- AI-powered (10%): ~$0.001 per assessment

**Monthly Cost Example** (1,000 triages):
- Question generation: ~$0 (already cached)
- Assessments:
  - 900 rule-based: $0
  - 100 AI-powered: $0.10
- **Total: $0.10/month for 1,000 triages**

**Scaling**:
- 10,000 triages/month: ~$1.00
- 100,000 triages/month: ~$10.00

---

## Database Schema

### New Tracking Fields

**symptoms_catalog**:
- `questions_generated` - Boolean flag for cached questions
- `generation_source` - 'ai_realtime' | 'pre_generated' | 'manual'
- `last_generated_at` - Timestamp of last generation
- `usage_count` - Number of times this symptom was triaged

**triage_questions**:
- `generation_source` - How this question was created
- `generated_at` - When it was generated

**triage_sessions**:
- `assessment_method` - 'rule_based' | 'ai_powered' | 'hybrid'
- `risk_score` - Calculated risk score (0-35)
- `processing_time_ms` - Performance tracking

---

## Monitoring & Maintenance

### Daily Checks

1. **Cache Coverage**: Should stay >80%
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE questions_generated = true)::float / COUNT(*) * 100 as coverage
   FROM symptoms_catalog;
   ```

2. **AI Usage**: Should be <15%
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE assessment_method = 'ai_powered')::float / COUNT(*) * 100 as ai_pct
   FROM triage_sessions
   WHERE started_at > NOW() - INTERVAL '7 days';
   ```

3. **Performance**: Should average <200ms
   ```sql
   SELECT AVG(processing_time_ms)
   FROM triage_sessions
   WHERE started_at > NOW() - INTERVAL '24 hours';
   ```

### When to Re-Generate

Re-run `npm run pre-generate` if:
- You add new common symptoms to catalog
- You update AI prompts and want new questions
- Coverage drops below 80%

---

## Troubleshooting

### Questions Not Caching

**Symptom**: Every request generates new questions

**Fix**: Check database migration applied:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'symptoms_catalog' AND column_name = 'questions_generated';
```

### All Assessments Using AI

**Symptom**: Cost is too high, all triages use AI

**Fix**: Check rule-based logic in `assess-triage-responses`:
- Verify risk score calculation
- Check premium user detection
- Ensure fallback to rule-based

### Slow Response Times

**Symptom**: Triage takes >1 second for cached symptoms

**Fix**: Check indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_symptoms_name ON symptoms_catalog(name);
CREATE INDEX IF NOT EXISTS idx_triage_questions_symptom ON triage_questions(symptom_id);
```

---

## Future Enhancements

Potential improvements to consider:

1. **Multi-language Support**: Generate questions in multiple languages
2. **A/B Testing**: Test different question sets for same symptom
3. **Machine Learning**: Improve risk weights based on actual outcomes
4. **Question Versioning**: Update questions without losing history
5. **Symptom Matching**: Use AI to match similar symptom searches

---

## Support

For issues or questions about the hybrid triage system:

1. Check analytics view: `SELECT * FROM triage_analytics`
2. Review edge function logs in Supabase dashboard
3. Test individual symptoms with generate-triage-questions function
4. Verify database migration applied successfully
