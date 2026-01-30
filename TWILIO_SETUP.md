# Twilio Phone Verification Setup

Your app now uses Twilio for SMS verification! Here's how to configure it:

## 1. Create a Twilio Account

1. Go to [Twilio's website](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## 2. Get Your Credentials

After signing up, you'll need these credentials from your [Twilio Console](https://console.twilio.com/):

1. **Account SID** - Found on your dashboard
2. **Auth Token** - Found on your dashboard (click to reveal)

## 3. Create a Twilio Verify Service

**This is required for SMS verification to work:**

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Explore Products** → **Verify** → **Services**
3. Click **Create Service**
4. Give it a name (e.g., "My App Verification")
5. Click **Create**
6. Copy the **Service SID** (starts with "VA...")

## 4. Configure Supabase Edge Functions

Add your Twilio credentials to your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add these **three** secrets:

   - `TWILIO_ACCOUNT_SID` = Your Account SID
   - `TWILIO_AUTH_TOKEN` = Your Auth Token
   - `TWILIO_VERIFY_SERVICE_SID` = Your Verify Service SID (from step 3)

## 5. Test the Integration

1. Open your app
2. Sign up with email
3. Verify your email
4. Enter your phone number (with country code, e.g., +1234567890)
5. You should receive an SMS with a 6-digit code
6. Enter the code to verify your phone number

## Free Tier Limitations

Twilio's free trial includes:
- $15.50 in free credit
- Can only send SMS to verified phone numbers
- To send to any number, you'll need to upgrade your account

### Adding Verified Phone Numbers (Free Trial)

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Verified Caller IDs**
3. Click "Add a new number"
4. Enter the phone number you want to test with
5. Verify it with the code Twilio sends

## Troubleshooting

### SMS Not Sending

- Check that **all three** Twilio secrets are set correctly in Supabase:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_VERIFY_SERVICE_SID`
- Make sure your phone number includes the country code (e.g., +1 for US, +234 for Nigeria)
- On free trial, ensure the phone number is verified in Twilio console

### "Resource was not found" Error

This error means you haven't created a Twilio Verify Service or the Service SID is wrong:
1. Go to [Twilio Verify Services](https://console.twilio.com/us1/develop/verify/services)
2. Create a new service if you don't have one
3. Copy the Service SID (starts with "VA...")
4. Add it to Supabase Edge Functions secrets as `TWILIO_VERIFY_SERVICE_SID`

### Invalid Code Error

- Codes expire after 10 minutes
- Request a new code if it's been too long
- Check for typos in the 6-digit code

### Testing Without SMS

During development, if Twilio isn't configured, the edge function will return the verification code in the error response for testing purposes. Remove this in production!

## Production Checklist

Before going live:
1. Remove the code return in error responses (in `send-phone-code` edge function)
2. Upgrade your Twilio account to remove the free trial limitations
3. Consider implementing rate limiting to prevent SMS spam
4. Monitor your Twilio usage and costs

## How It Works

1. User enters phone number
2. App calls `send-phone-code` edge function
3. Edge function generates a 6-digit code
4. Code is stored in `phone_verifications` table
5. Twilio sends SMS with the code
6. User enters the code
7. App calls `verify-phone-code` edge function
8. Edge function validates the code
9. User's phone number is marked as verified in their profile
