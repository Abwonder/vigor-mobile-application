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
 * THE CREATION MOMENT: Twilio + Supabase Sync
 */
// @ts-ignore: Deno is available in Edge Runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { phoneNumber, code, role } = await req.json();

    if (!phoneNumber || !code) {
      return new Response(
        JSON.stringify({ error: 'Phone and code are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 1. Initialize Credentials
    // @ts-ignore: Deno is available in Edge Runtime
    const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    // @ts-ignore: Deno is available in Edge Runtime
    const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    // @ts-ignore: Deno is available in Edge Runtime
    const TWILIO_SERVICE = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');

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

    // 2. Verify with Twilio
    const twilioUrl = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE}/VerificationCheck`;
    const twilioAuth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phoneNumber, Code: code }),
    });

    const twilioData = await twilioRes.json();

    if (twilioData.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 3. User Resolution
    const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, '');
    const tempEmail = `vigorcare+${sanitizedPhone}@gmail.com`;

    const { data: usersData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    // Use type-safe finding
    let user = usersData?.users.find(
      (u: any) => u.phone === phoneNumber || u.email === tempEmail,
    );

    if (!user) {
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: tempEmail,
          phone: phoneNumber,
          phone_confirm: true,
          email_confirm: true,
          user_metadata: {
            role: role || 'service_user',
            signup_method: 'phone',
          },
        });
      if (createError) throw createError;
      user = newUser.user;
    } else {
      const { data: updatedUser, error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          phone_confirm: true,
          email_confirm: true,
          user_metadata: { ...user.user_metadata, phone_verified: true },
        });
      if (updateError) throw updateError;
      user = updatedUser.user;
    }

    // 4. Session Exchange
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
      });

    if (linkError) throw linkError;

    // Server-side exchange to get raw tokens
    const exchangeRes = await fetch(linkData.properties.action_link, {
      redirect: 'manual',
    });
    const location = exchangeRes.headers.get('location');

    if (!location) throw new Error('Authentication link exchange failed.');

    const hashMatch = location.match(
      /#access_token=([^&]+)&refresh_token=([^&]+)/,
    );
    if (!hashMatch)
      throw new Error('Could not extract tokens from session link.');

    // 5. Build Response
    return new Response(
      JSON.stringify({
        success: true,
        user,
        session: {
          access_token: hashMatch[1],
          refresh_token: hashMatch[2],
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error('FATAL PHONE VERIFY ERROR:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
