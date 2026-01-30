import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import jwt from "npm:jsonwebtoken@9.0.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TokenRequest {
  consultationId: string;
  roomName?: string;
}

interface TwilioGrant {
  room?: string;
}

interface TwilioToken {
  grants: {
    video?: TwilioGrant;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { consultationId, roomName }: TokenRequest = await req.json();

    if (!consultationId) {
      throw new Error("consultationId is required");
    }

    // Verify user is part of this consultation
    const { data: consultation, error: consultationError } = await supabase
      .from("consultations")
      .select("id, patient_id, provider_id, status")
      .eq("id", consultationId)
      .maybeSingle();

    if (consultationError || !consultation) {
      throw new Error("Consultation not found");
    }

    // Check if user is either the patient or provider
    const isPatient = consultation.patient_id === user.id;
    const isProvider = consultation.provider_id === user.id;

    if (!isPatient && !isProvider) {
      throw new Error("User is not authorized for this consultation");
    }

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioApiKeySid = Deno.env.get("TWILIO_API_KEY_SID");
    const twilioApiKeySecret = Deno.env.get("TWILIO_API_KEY_SECRET");

    if (!twilioAccountSid || !twilioApiKeySid || !twilioApiKeySecret) {
      throw new Error("Twilio credentials not configured");
    }

    // Generate room name if not provided
    const videoRoomName = roomName || `consultation-${consultationId}`;

    // Create Twilio access token using JWT
    const identity = `${isProvider ? "provider" : "patient"}-${user.id}`;

    const videoGrant: TwilioGrant = {
      room: videoRoomName,
    };

    const tokenPayload: TwilioToken = {
      grants: {
        video: videoGrant,
      },
    };

    const accessToken = jwt.sign(
      {
        jti: `${twilioApiKeySid}-${Date.now()}`,
        iss: twilioApiKeySid,
        sub: twilioAccountSid,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        grants: tokenPayload.grants,
        identity: identity,
      },
      twilioApiKeySecret,
      { algorithm: "HS256" }
    );

    // Update consultation with video room info if this is the first time
    if (isProvider && consultation.status === "pending") {
      await supabase
        .from("consultations")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", consultationId);
    }

    return new Response(
      JSON.stringify({
        token: accessToken,
        roomName: videoRoomName,
        identity: identity,
        consultation: {
          id: consultation.id,
          status: consultation.status,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating video token:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});