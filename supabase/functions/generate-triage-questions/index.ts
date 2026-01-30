import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenAI } from 'npm:@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateQuestionsRequest {
  symptomName: string;
  symptomCategory: string;
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  cleaned = cleaned.trim();

  return cleaned;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { symptomName, symptomCategory }: GenerateQuestionsRequest = await req.json();

    // Step 1: Check if symptom exists in catalog
    let { data: symptomRecord } = await supabaseClient
      .from('symptoms_catalog')
      .select('id, questions_generated, generation_source')
      .eq('name', symptomName)
      .maybeSingle();

    // Step 2: If symptom exists and has questions, return cached version
    if (symptomRecord?.questions_generated) {
      const { data: questions } = await supabaseClient
        .from('triage_questions')
        .select('*')
        .eq('symptom_id', symptomRecord.id)
        .order('order_number');

      if (questions && questions.length > 0) {
        const processingTime = Date.now() - startTime;

        return new Response(
          JSON.stringify({
            questions,
            cached: true,
            symptomId: symptomRecord.id,
            processingTime,
            message: 'Questions loaded from cache (instant response)'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Step 3: Generate new questions using Google Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your Supabase Edge Function secrets.');
    }

    const prompt = `Generate exactly 7 diagnostic triage questions for: ${symptomName}

Rules:
- Progress from general to specific
- Include severity, duration, associated symptoms
- Help determine emergency vs routine vs self-care
- Keep all text simple and clear
- Use only basic punctuation
- Avoid special characters

Risk weights: 0=none, 1-2=mild, 3-4=moderate, 5=emergency

Return JSON with questions array. Each question must have:
- question_text: the question
- question_type: always "multiple_choice"
- options: array of option strings
- risk_weight_list: array of objects with "option" and "weight" for each option

Example:
{
  "questions": [{
    "question_text": "How severe is the pain?",
    "question_type": "multiple_choice",
    "options": ["Mild", "Moderate", "Severe"],
    "risk_weight_list": [
      {"option": "Mild", "weight": 1},
      {"option": "Moderate", "weight": 3},
      {"option": "Severe", "weight": 5}
    ]
  }]
}`;

    const schema = {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question_text: { type: 'string' },
              question_type: { type: 'string', enum: ['multiple_choice'] },
              options: {
                type: 'array',
                items: { type: 'string' }
              },
              risk_weight_list: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    option: { type: 'string' },
                    weight: { type: 'integer' }
                  },
                  required: ['option', 'weight']
                }
              }
            },
            required: ['question_text', 'question_type', 'options', 'risk_weight_list']
          }
        }
      },
      required: ['questions']
    };

    // Call Google Gemini API using SDK with retry logic
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let generatedQuestions;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: prompt,
          config: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3072,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        const responseText = cleanJsonResponse(response.text);
        generatedQuestions = JSON.parse(responseText);

        if (generatedQuestions?.questions && Array.isArray(generatedQuestions.questions)) {
          break;
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!generatedQuestions) {
      throw lastError || new Error('Failed to generate questions after 3 attempts');
    }

    // Step 4: If symptom doesn't exist in catalog, create it (auto-learning)
    if (!symptomRecord) {
      const { data: newSymptom, error: createError } = await supabaseClient
        .from('symptoms_catalog')
        .insert({
          name: symptomName,
          category: symptomCategory,
          description: `AI-generated symptom: ${symptomName}`,
          common: false,
          questions_generated: true,
          generation_source: 'ai_realtime',
          last_generated_at: new Date().toISOString(),
          usage_count: 0
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating symptom:', createError);
        throw createError;
      }

      symptomRecord = newSymptom;
    } else {
      // Update existing symptom to mark questions as generated
      await supabaseClient
        .from('symptoms_catalog')
        .update({
          questions_generated: true,
          generation_source: 'ai_realtime',
          last_generated_at: new Date().toISOString()
        })
        .eq('id', symptomRecord.id);
    }

    // Step 5: Save generated questions to database for future caching
    const questionsToInsert = generatedQuestions.questions.map((q: any, index: number) => {
      // Convert risk_weight_list array to risk_weights object
      const riskWeights: Record<string, number> = {};
      if (q.risk_weight_list && Array.isArray(q.risk_weight_list)) {
        for (const item of q.risk_weight_list) {
          riskWeights[item.option] = item.weight;
        }
      }

      return {
        symptom_id: symptomRecord!.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        risk_weights: riskWeights,
        order_number: index + 1,
        generation_source: 'ai_realtime',
        generated_at: new Date().toISOString()
      };
    });

    const { data: savedQuestions, error: insertError } = await supabaseClient
      .from('triage_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Error saving questions:', insertError);
      throw insertError;
    }

    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        questions: savedQuestions,
        cached: false,
        symptomId: symptomRecord!.id,
        processingTime,
        message: `Questions generated by AI in ${processingTime}ms (cached for next time)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to generate triage questions. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});