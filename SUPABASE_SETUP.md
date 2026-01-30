# Supabase Configuration Guide

This document provides step-by-step instructions for configuring your Supabase project to enable phone authentication with Twilio and messaging capabilities.

## 1. Configure Phone Authentication with Twilio

### Step 1: Navigate to Authentication Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Authentication** in the left sidebar
4. Click on **Providers**
5. Find and click on **Phone** provider

### Step 2: Enable Phone Authentication

1. Toggle **Enable Phone provider** to ON
2. In the **Twilio Settings** section, enter your credentials:
   - **Twilio Account SID**: `YOUR_TWILIO_ACCOUNT_SID`
   - **Twilio Auth Token**: `YOUR_TWILIO_AUTH_TOKEN`
   - **Twilio Verify Service SID**: `YOUR_TWILIO_VERIFY_SERVICE_SID`
3. Click **Save**

### Step 3: Configure OTP Settings (Optional)

You can customize OTP settings:

- **OTP expiry duration**: Default is 60 seconds (adjust if needed)
- **OTP length**: Default is 6 digits

---

## 2. Enable Realtime for Messaging

### Step 1: Enable Realtime

1. Go to **Database** → **Replication**
2. Find these tables and enable realtime:
   - `conversations`
   - `messages`
   - `conversation_participants`
   - `typing_indicators`
   - `message_read_receipts`

3. For each table:
   - Click on the table
   - Toggle **Enable Realtime** to ON
   - Click **Save**

---

## 3. Verify Database Migrations

All database migrations should already be applied. To verify:

1. Go to **Database** → **Tables**
2. Confirm these tables exist:
   - `profiles`
   - `conversations`
   - `conversation_participants`
   - `messages`
   - `message_attachments`
   - `message_read_receipts`
   - `typing_indicators`

---

## 4. Verify Storage Bucket

### Step 1: Check Storage Bucket

1. Go to **Storage** in the left sidebar
2. Verify the `message-attachments` bucket exists
3. If it doesn't exist, the migration will create it automatically

### Step 2: Verify Bucket Policies

The bucket should have these policies:

- Users can upload to their own folder
- Users can view files in their conversations
- Users can delete their own files

These policies are automatically created by the migration.

---

## 5. Email Configuration (Already Configured)

Email authentication should already be enabled by default. To verify:

1. Go to **Authentication** → **Providers**
2. Confirm **Email** provider is enabled
3. Confirm **Enable email confirmations** is set based on your preference

---

## 6. Testing the Setup

### Test Phone Verification

1. Run your app
2. Go through signup flow
3. Enter your phone number with country code (e.g., +1234567890)
4. You should receive an SMS with a 6-digit code
5. Enter the code to verify

### Test Messaging

1. Complete signup and onboarding
2. Go to Messages tab
3. Click the + button to start a new conversation
4. Search for a user and start chatting
5. Test sending text messages
6. Test sending images
7. Verify read receipts appear (checkmarks)
8. Verify typing indicators work

---

## 7. Troubleshooting

### Phone Verification Not Working

- **Issue**: Not receiving SMS codes
- **Solution**:
  - Verify Twilio credentials are correct
  - Check Twilio dashboard for delivery logs
  - Ensure phone number includes country code (e.g., +1 for US)
  - Verify Twilio Verify Service is active

### Messages Not Appearing in Real-time

- **Issue**: Messages don't appear instantly
- **Solution**:
  - Ensure Realtime is enabled for all messaging tables
  - Check browser console for WebSocket connection errors
  - Verify RLS policies allow reading messages

### Images Not Uploading

- **Issue**: Image upload fails
- **Solution**:
  - Verify `message-attachments` storage bucket exists
  - Check storage policies are correctly configured
  - Ensure user has permissions to upload

### Authentication Errors

- **Issue**: Users can't sign up or log in
- **Solution**:
  - Verify email provider is enabled
  - Check that confirmations are configured correctly
  - Review RLS policies on `profiles` table

---

## 8. Production Checklist

Before deploying to production:

- [ ] Phone auth is properly configured with Twilio
- [ ] Realtime is enabled for all messaging tables
- [ ] Storage bucket and policies are configured
- [ ] RLS policies are tested and secure
- [ ] Email templates are customized (optional)
- [ ] Rate limiting is configured (optional)
- [ ] Backup policies are in place

---

## Support

If you encounter issues:

1. Check Supabase Dashboard logs
2. Review browser console for errors
3. Check Twilio dashboard for SMS delivery status
4. Verify all migrations have been applied
5. Ensure environment variables are correctly set

---

## Environment Variables

Your `.env` file should contain:

```
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url

TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_TWILIO_VERIFY_SERVICE_SID
```

Note: Twilio credentials are only used by Supabase backend, not exposed to the client.
