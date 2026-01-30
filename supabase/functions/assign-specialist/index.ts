// @ts-ignore: Deno runtime imports
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// @ts-ignore: Deno runtime imports
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * ASSIGN SPECIALIST EDGE FUNCTION
 * Handles specialist assignment to triage cases and sends notifications
 */
// @ts-ignore: Deno is available in Edge Runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { caseId, specialistId, phpId } = await req.json();

    if (!caseId || !specialistId) {
      return new Response(
        JSON.stringify({ error: 'Case ID and Specialist ID are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // @ts-ignore: Deno is available in Edge Runtime
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore: Deno is available in Edge Runtime
    const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Update triage case with specialist assignment
    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from('triage_cases')
      .update({
        specialist_id: specialistId,
        php_id: phpId,
        status: 'assigned_to_specialist',
        assigned_at: new Date().toISOString(),
        resolution_type: 'specialist_referral',
      })
      .eq('id', caseId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. TODO: Send push notification to specialist
    // This would integrate with your push notification service
    // For now, we'll log it
    console.log(
      `Notification sent to specialist ${specialistId} for case ${caseId}`,
    );

    // 3. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Specialist assigned successfully',
        case: updatedCase,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error('ASSIGN SPECIALIST ERROR:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
