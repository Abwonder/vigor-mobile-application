# Triage System Flow Diagrams

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER STARTS HERE                             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Find Care Screen       │
                    │  (app/find-care.tsx)     │
                    │                          │
                    │  - Search symptoms       │
                    │  - Browse categories     │
                    └──────────────────────────┘
                                   │
                                   │ User selects "Headache"
                                   ▼
                    ┌──────────────────────────┐
                    │  Start Triage Modal      │
                    │ (components/             │
                    │  TriageModals.tsx)       │
                    │                          │
                    │  "A nurse will guide you"│
                    └──────────────────────────┘
                                   │
                                   │ User clicks "Continue"
                                   ▼
                    ┌──────────────────────────┐
                    │   Assigning Modal        │
                    │  (2 seconds animation)   │
                    │                          │
                    │  "Assigning you..."      │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ Condition Preview Modal  │
                    │                          │
                    │  - Shows nurse           │
                    │  - Shows symptom         │
                    │  - Coverage plan         │
                    │  - Triage duration       │
                    └──────────────────────────┘
                                   │
                                   │ User clicks "Start Triage"
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼──────────┐    ┌────────────▼─────────┐
          │  RULE-BASED PATH   │    │   AI-POWERED PATH    │
          │   (Current)        │    │     (New!)           │
          └─────────┬──────────┘    └────────────┬─────────┘
                    │                             │
                    │                             │
    ┌───────────────▼────────────┐   ┌───────────▼──────────────┐
    │ Load Pre-Written Questions │   │ Generate Questions w/ AI │
    │                            │   │                          │
    │ FROM: Database             │   │ CALL: Edge Function      │
    │ triage_questions table     │   │ generate-triage-questions│
    └───────────────┬────────────┘   └───────────┬──────────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Question Flow Screen    │
                    │ (app/triage-question.tsx)│
                    │                          │
                    │  Question 1/7            │
                    │  [Progress bar]          │
                    │  [Answer options]        │
                    └──────────────────────────┘
                                   │
                                   │ User answers Q1
                                   │ Saves to triage_responses
                                   ▼
                    ┌──────────────────────────┐
                    │  Question Flow Screen    │
                    │                          │
                    │  Question 2/7            │
                    │  [Progress bar]          │
                    │  [Answer options]        │
                    └──────────────────────────┘
                                   │
                                   │ ... continues for all 7 questions
                                   ▼
                    ┌──────────────────────────┐
                    │  Question Flow Screen    │
                    │                          │
                    │  Question 7/7            │
                    │  [Submit response]       │
                    └──────────────────────────┘
                                   │
                                   │ User submits final answer
                                   ▼
                    ┌──────────────────────────┐
                    │  Waiting Room Screen     │
                    │ (app/triage-waiting.tsx) │
                    │                          │
                    │  Timer: 14:53            │
                    │  Health tips (rotating)  │
                    │  "Your triage is being   │
                    │   reviewed..."           │
                    └──────────────────────────┘
                                   │
                                   │ Timer reaches 0:00
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼──────────┐    ┌────────────▼─────────┐
          │  RULE-BASED        │    │   AI-POWERED         │
          │  ASSESSMENT        │    │   ASSESSMENT         │
          └─────────┬──────────┘    └────────────┬─────────┘
                    │                             │
                    │                             │
    ┌───────────────▼────────────┐   ┌───────────▼──────────────┐
    │ Calculate Risk Score       │   │ CALL: Edge Function      │
    │                            │   │ assess-triage-responses  │
    │ Loop through answers:      │   │                          │
    │ - BP history? +2 points    │   │ AI analyzes ALL answers  │
    │ - Chest pain? +5 points    │   │ + Calculates risk score  │
    │ - Severe? +4 points        │   │ + Writes assessment      │
    │                            │   │ + Personalized advice    │
    │ Total score → Severity     │   │                          │
    └───────────────┬────────────┘   └───────────┬──────────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Save to Database       │
                    │  triage_outcomes table   │
                    │                          │
                    │  - severity              │
                    │  - severity_title        │
                    │  - severity_description  │
                    │  - symptoms_summary      │
                    │  - recommendation        │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │  Outcome Screen          │
                    │ (app/triage-outcome.tsx) │
                    │                          │
                    │  [Severity Icon]         │
                    │  "This may be an         │
                    │   emergency."            │
                    │                          │
                    │  [Call Emergency]        │
                    │  [Assign Specialist]     │
                    └──────────────────────────┘
                                   │
                                   │ User clicks "Assign Specialist"
                                   ▼
                    ┌──────────────────────────┐
                    │  Assignment Modal        │
                    │                          │
                    │  "You've been assigned   │
                    │   a specialist!"         │
                    │                          │
                    │  [Go to Consultation]    │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Home Screen            │
                    │ (app/(tabs)/index.tsx)   │
                    │                          │
                    │  Consultation info shows │
                    └──────────────────────────┘
```

---

## Algorithm Comparison: Rule-Based vs AI

### Rule-Based Algorithm (Current)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RULE-BASED ASSESSMENT                        │
└─────────────────────────────────────────────────────────────────┘

INPUTS:
┌──────────────────────────────┐
│ Patient Responses            │
│ ────────────────             │
│ Q1: "Yes"                    │
│ Q2: "No"                     │
│ Q3: ["Chest pain", "Dizzy"]  │
│ Q4: "Severe"                 │
│ ...                          │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ HARDCODED RULES              │
│ ────────────────             │
│ IF answer includes           │
│    "high blood pressure"     │
│ THEN score += 2              │
│                              │
│ IF answer includes           │
│    "Chest pain"              │
│ THEN score += 5              │
│                              │
│ IF answer == "Severe"        │
│ THEN score += 4              │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ CALCULATE TOTAL SCORE        │
│ ────────────────             │
│ Total = 2 + 5 + 4 = 11       │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ MAP SCORE TO SEVERITY        │
│ ────────────────             │
│ IF score >= 8  → emergency   │
│ IF score >= 4  → caution     │
│ IF score < 4   → low_risk    │
│                              │
│ Result: emergency (11 >= 8)  │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ HARDCODED MESSAGES           │
│ ────────────────             │
│ Title: "This may be an       │
│        emergency"            │
│ Description: (generic text)  │
│ Recommendation: (generic)    │
└──────────────────────────────┘
                │
                ▼
OUTPUT: Severity + Generic Messages
```

### AI-Powered Algorithm (New)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-POWERED ASSESSMENT                        │
└─────────────────────────────────────────────────────────────────┘

INPUTS:
┌──────────────────────────────┐
│ Patient Responses            │
│ ────────────────             │
│ Q1: Do you have BP history?  │
│     Answer: "Yes"            │
│ Q2: Are you on medication?   │
│     Answer: "No"             │
│ Q3: Other symptoms?          │
│     Answer: ["Chest pain"]   │
│ Q4: Severity level?          │
│     Answer: "Severe"         │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ FETCH AI-GENERATED WEIGHTS   │
│ ────────────────             │
│ FROM: triage_questions table │
│ risk_weights column          │
│                              │
│ Q1 weights: {"Yes": 2}       │
│ Q2 weights: {"No": 1}        │
│ Q3 weights: {"Chest": 5}     │
│ Q4 weights: {"Severe": 5}    │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ CALCULATE INITIAL SCORE      │
│ ────────────────             │
│ Total = 2 + 1 + 5 + 5 = 13   │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ SEND TO OPENAI API           │
│ ────────────────             │
│ Prompt:                      │
│ "Review this patient who     │
│  has chest pain, severe      │
│  symptoms, BP history.       │
│  Risk score: 13/35           │
│                              │
│  Provide assessment as JSON" │
└──────────────────────────────┘
                │
                ▼
┌──────────────────────────────┐
│ AI ANALYZES & RESPONDS       │
│ ────────────────             │
│ AI considers:                │
│ - Medical literature         │
│ - Symptom combinations       │
│ - Risk factors               │
│ - Best practices             │
│                              │
│ Returns JSON:                │
│ {                            │
│   "severity": "emergency",   │
│   "title": "...",            │
│   "description": "...",      │
│   "symptoms_summary": "...", │
│   "recommendation": "..."    │
│ }                            │
└──────────────────────────────┘
                │
                ▼
OUTPUT: Severity + PERSONALIZED Messages
```

---

## Data Flow: Questions & Answers

```
┌────────────────────────────────────────────────────────────────┐
│                      DATABASE TABLES                           │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ symptoms_catalog                                                │
├─────────────────────────────────────────────────────────────────┤
│ id          │ name          │ category                         │
│ uuid        │ text          │ text                             │
├─────────────────────────────────────────────────────────────────┤
│ abc-123     │ Headache      │ General Symptoms                 │
│ def-456     │ Chest Pain    │ Respiratory & Chest              │
│ ghi-789     │ Fever         │ General Symptoms                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ One symptom has many questions
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ triage_questions                                                │
├─────────────────────────────────────────────────────────────────┤
│ id     │ symptom_id │ question_text     │ options    │ risk... │
│ uuid   │ uuid       │ text              │ jsonb      │ jsonb   │
├─────────────────────────────────────────────────────────────────┤
│ q1-111 │ abc-123    │ "BP history?"     │ ["Yes"]    │ {"Y":2} │
│ q2-222 │ abc-123    │ "On medication?"  │ ["Yes"]    │ {"Y":1} │
│ q3-333 │ abc-123    │ "Other symptoms?" │ ["Chest"]  │ {"C":5} │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User starts triage session
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ triage_sessions                                                 │
├─────────────────────────────────────────────────────────────────┤
│ id          │ user_id │ symptom_id │ status      │ current... │
│ uuid        │ uuid    │ uuid       │ text        │ int        │
├─────────────────────────────────────────────────────────────────┤
│ sess-999    │ user-1  │ abc-123    │ in_progress │ 3          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User answers questions
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ triage_responses                                                │
├─────────────────────────────────────────────────────────────────┤
│ id     │ session_id │ question_id │ answer                     │
│ uuid   │ uuid       │ uuid        │ text                       │
├─────────────────────────────────────────────────────────────────┤
│ r1-aaa │ sess-999   │ q1-111      │ "Yes"                      │
│ r2-bbb │ sess-999   │ q2-222      │ "No"                       │
│ r3-ccc │ sess-999   │ q3-333      │ ["Chest pain", "Dizzy"]    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Assessment completes
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ triage_outcomes                                                 │
├─────────────────────────────────────────────────────────────────┤
│ id    │ session │ severity  │ title        │ description       │
│ uuid  │ uuid    │ text      │ text         │ text              │
├─────────────────────────────────────────────────────────────────┤
│ out-1 │ sess-99 │ emergency │ "May be..." │ "Your symptoms..."│
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

```
┌────────────────────────────────────────────────────────────────┐
│                    YOUR APP (React Native)                     │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Database    │  │ Edge Functions│  │  Auth        │       │
│  │  (Postgres)  │  │  (Deno)      │  │  (Users)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                            │                                   │
│                            │ When AI needed                    │
│                            ▼                                   │
│                    ┌──────────────┐                           │
│                    │  OpenAI API  │                           │
│                    │  (GPT-4)     │                           │
│                    └──────────────┘                           │
└────────────────────────────────────────────────────────────────┘
```

That's the complete picture! 🎨
