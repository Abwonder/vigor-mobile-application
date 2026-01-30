import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, userId } = await req.json();

    if (!phoneNumber || !userId) {
      return new Response(
        JSON.stringify({ error: "Phone number and user ID are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioVerifyServiceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!twilioAccountSid || !twilioAuthToken || !twilioVerifyServiceSid) {
      console.error("Twilio credentials not configured");
      return new Response(
        JSON.stringify({
          error: "SMS service not configured. Please check Twilio credentials in Supabase settings."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Channel: "sms",
      }),
    });

    const responseData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", responseData);
      return new Response(
        JSON.stringify({
          error: `Failed to send SMS: ${responseData.message || 'Unknown error'}`,
          details: responseData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});