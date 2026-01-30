import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenAI } from 'npm:@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AssessTriageRequest {
  sessionId: string;
  symptomName: string;
  userId?: string;
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

    const { sessionId, symptomName, userId }: AssessTriageRequest = await req.json();

    // Get all responses for this session
    const { data: responses, error: responsesError } = await supabaseClient
      .from('triage_responses')
      .select(`
        question_text,
        answer,
        triage_questions (
          risk_weights
        )
      `)
      .eq('session_id', sessionId);

    if (responsesError) throw responsesError;

    // Step 1: Calculate risk score using AI-generated weights (Rule-based scoring)
    let totalRiskScore = 0;
    const symptomSummary: string[] = [];

    responses?.forEach((response: any) => {
      const riskWeights = response.triage_questions?.risk_weights || {};

      // Handle multi-select answers
      let answers: string[] = [];
      try {
        answers = JSON.parse(response.answer);
      } catch {
        answers = [response.answer];
      }

      // Add up risk points for each answer
      answers.forEach((answer: string) => {
        const weight = riskWeights[answer] || 0;
        totalRiskScore += weight;

        if (weight > 0) {
          symptomSummary.push(answer);
        }
      });
    });

    // Step 2: Determine if we need AI assessment (Hybrid Strategy)
    let useAiAssessment = false;
    let assessmentReason = 'rule_based';

    // Check if user is premium/VIP
    let isPremiumUser = false;
    if (userId) {
      const { data: subscription } = await supabaseClient
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      isPremiumUser = subscription?.tier === 'premium' || subscription?.tier === 'vip';
    }

    // Decision logic for AI assessment
    if (isPremiumUser) {
      useAiAssessment = true;
      assessmentReason = 'premium_user';
    } else if (totalRiskScore >= 7 && totalRiskScore <= 10) {
      useAiAssessment = true;
      assessmentReason = 'borderline_score';
    } else if (responses && responses.length > 10) {
      useAiAssessment = true;
      assessmentReason = 'complex_case';
    }

    // Step 3: Rule-based assessment (Fast & Free - 90% of cases)
    if (!useAiAssessment) {
      const severity = totalRiskScore >= 15 ? 'emergency' :
                      totalRiskScore >= 8 ? 'caution' : 'low_risk';

      const severityMessages = {
        emergency: {
          title: 'This may be an emergency.',
          description: 'Based on your responses, you should seek immediate medical attention. Call emergency services or go to the nearest emergency room.',
          recommendation: 'Seek emergency care immediately'
        },
        caution: {
          title: 'You should see a doctor soon.',
          description: 'Your symptoms suggest you should schedule an appointment with a healthcare provider within the next 24-48 hours.',
          recommendation: 'Schedule a doctor appointment within 1-2 days'
        },
        low_risk: {
          title: 'You can likely manage this at home.',
          description: 'Your symptoms appear mild. Monitor your condition and seek medical care if symptoms worsen or persist.',
          recommendation: 'Monitor symptoms and practice self-care'
        }
      };

      const processingTime = Date.now() - startTime;

      // Update triage session with results
      await supabaseClient
        .from('triage_sessions')
        .update({
          status: 'completed',
          assessment_method: 'rule_based',
          risk_score: totalRiskScore,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      return new Response(
        JSON.stringify({
          severity,
          severity_title: severityMessages[severity].title,
          severity_description: severityMessages[severity].description,
          symptoms_summary: symptomSummary.join(', '),
          recommendation: severityMessages[severity].recommendation,
          riskScore: totalRiskScore,
          assessmentMethod: 'rule_based',
          processingTime,
          aiGenerated: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: AI-Powered Assessment (Premium/Complex cases - 10% of cases)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      // Fallback to rule-based if AI not available
      const severity = totalRiskScore >= 15 ? 'emergency' :
                      totalRiskScore >= 8 ? 'caution' : 'low_risk';

      const processingTime = Date.now() - startTime;

      await supabaseClient
        .from('triage_sessions')
        .update({
          status: 'completed',
          assessment_method: 'rule_based',
          risk_score: totalRiskScore,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      return new Response(
        JSON.stringify({
          severity,
          riskScore: totalRiskScore,
          assessmentMethod: 'rule_based',
          processingTime,
          fallback: true,
          message: 'AI assessment unavailable, using rule-based scoring'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get AI assessment
    const responsesText = responses?.map(r =>
      `Q: ${r.question_text}\nA: ${r.answer}`
    ).join('\n\n');

    const prompt = `You are a medical triage AI. Review these patient responses for ${symptomName}:

${responsesText}

Risk Score (calculated): ${totalRiskScore} out of 35 points
Assessment Reason: ${assessmentReason}

Provide a JSON response with:
{
  "severity": "emergency" | "caution" | "low_risk",
  "severity_title": "Short title (e.g., 'This may be an emergency.')",
  "severity_description": "2-3 sentence explanation",
  "symptoms_summary": "Comma-separated list of key symptoms",
  "recommendation": "Specific next step recommendation",
  "additional_notes": "Any additional context or warning signs to watch for"
}

Guidelines:
- "emergency" (score 15+): Requires immediate medical attention
- "caution" (score 7-14): Should see doctor soon
- "low_risk" (score 0-6): Can monitor at home

Be empathetic but clear. Provide personalized advice based on the specific responses. Return ONLY valid JSON.`;

    // Call Google Gemini API using SDK
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const responseText = response.text;
    const assessment = JSON.parse(responseText);

    const processingTime = Date.now() - startTime;

    // Update triage session with AI results
    await supabaseClient
      .from('triage_sessions')
      .update({
        status: 'completed',
        assessment_method: 'ai_powered',
        risk_score: totalRiskScore,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return new Response(
      JSON.stringify({
        ...assessment,
        riskScore: totalRiskScore,
        assessmentMethod: 'ai_powered',
        assessmentReason,
        processingTime,
        aiGenerated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to assess triage responses. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});