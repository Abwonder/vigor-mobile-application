# Twilio Video Setup Guide

This guide will help you set up Twilio Programmable Video for video consultations in your app.

## Prerequisites

- A Twilio account (you should already have one from phone verification setup)
- Access to the Twilio Console

## Step 1: Access Your Twilio Console

1. Go to [https://console.twilio.com](https://console.twilio.com)
2. Log in with your Twilio account credentials

## Step 2: Get Your Account SID

1. From the Twilio Console Dashboard, you'll see your **Account SID** displayed prominently
2. Copy this value - you likely already have it in your `.env` file as `TWILIO_ACCOUNT_SID`

## Step 3: Create an API Key for Video

1. In the Twilio Console, navigate to **Account** → **API keys & tokens**
   - Direct link: [https://console.twilio.com/us1/account/keys-credentials/api-keys](https://console.twilio.com/us1/account/keys-credentials/api-keys)

2. Click the **Create API Key** button (the red "+" button)

3. Fill in the form:
   - **Friendly Name**: Enter something like "Video Consultation API Key"
   - **Region**: Choose your region (or leave default)
   - **Key Type**: Select **Standard**

4. Click **Create API Key**

5. **IMPORTANT**: On the next screen, you'll see:
   - **SID**: This is your `TWILIO_API_KEY_SID` (starts with `SK...`)
   - **Secret**: This is your `TWILIO_API_KEY_SECRET`

   **⚠️ CRITICAL**: Copy and save the **Secret** immediately! It will only be shown once. If you lose it, you'll need to create a new API key.

## Step 4: Verify Twilio Video is Enabled

1. In the Twilio Console, go to **Explore Products** → **Video**
   - Direct link: [https://console.twilio.com/us1/develop/video/overview](https://console.twilio.com/us1/develop/video/overview)

2. If you see a "Get Started" or "Enable" button, click it to enable Twilio Video for your account

3. You may need to verify your account or add payment information if you haven't already

## Step 5: Configure Your Environment Variables

Add these credentials to your `.env` file:

```env
# Twilio Account Credentials (you likely already have this)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key for Video (NEW - from Step 3)
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_secret_here

# Optional: Twilio Video Configuration
TWILIO_VIDEO_ROOM_TYPE=group  # Options: group, peer-to-peer, group-small
```

## Step 6: Verify Your Setup

Once you've added the credentials, I'll create:
1. A Supabase Edge Function to generate video access tokens
2. Video call components with all the features shown in your design

## Twilio Video Pricing (FYI)

- **Group Rooms**: $0.0015/participant/minute (best for doctor-patient calls)
- **Peer-to-Peer Rooms**: $0.0005/participant/minute (cheaper, but less reliable for 2+ participants)
- **Free Trial**: 10,000 minutes included for testing

For a typical 20-minute consultation:
- Cost: $0.03 per participant (doctor + patient = $0.06 total)

## Important Notes

1. **API Key Security**: Never commit your API Key Secret to version control
2. **Development Build Required**: Twilio Video requires native modules, so you'll need to create an Expo development build (not Expo Go)
3. **Permissions**: The app will need camera and microphone permissions

## Next Steps

Once you have the credentials:
1. Add them to your `.env` file
2. Let me know you're ready
3. I'll implement the complete video consultation system

## Troubleshooting

**Can't find API Keys section?**
- Make sure you're logged into the correct Twilio account
- Try this direct link: [https://console.twilio.com/us1/account/keys-credentials/api-keys](https://console.twilio.com/us1/account/keys-credentials/api-keys)

**Video product not available?**
- Some trial accounts need verification before accessing Video
- Contact Twilio support to enable Video for your account

**Need help?**
- Twilio Support: [https://support.twilio.com](https://support.twilio.com)
- Twilio Video Docs: [https://www.twilio.com/docs/video](https://www.twilio.com/docs/video)
