# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your VigorCare application.

## Prerequisites

- A Google Cloud Platform account
- Your Supabase project URL and anon key (already configured in `.env`)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required app information:
     - App name: **VigorCare**
     - User support email: Your email
     - Developer contact email: Your email
   - Click **Save and Continue**
   - Skip the Scopes section (click **Save and Continue**)
   - Add test users if needed
   - Click **Save and Continue**

## Step 2: Configure OAuth Client

1. Select **Web application** as the application type
2. Name it **VigorCare Web Client**
3. Add **Authorized redirect URIs**:
   ```
   https://esdrtcevinpcyzfebjgv.supabase.co/auth/v1/callback
   ```
   Replace `esdrtcevinpcyzfebjgv` with your actual Supabase project reference ID

4. Click **Create**
5. Copy the **Client ID** and **Client Secret** - you'll need these next

## Step 3: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and click on it
5. Enable the Google provider
6. Paste your **Client ID** and **Client Secret** from Step 2
7. Click **Save**

## Step 4: Configure Redirect URLs

### For Web Development (localhost)

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add `http://localhost:3000` to **Redirect URLs**

### For Mobile Apps (Production)

1. In Google Cloud Console, add these additional redirect URIs:
   ```
   myapp://
   myapp://select-role
   myapp://(tabs)
   ```

2. In Supabase, add these to your **Redirect URLs** under **Authentication** > **URL Configuration**:
   ```
   myapp://select-role
   myapp://(tabs)
   ```

## Step 5: Test the Integration

1. Make sure your app is running
2. Click the "Continue with Google" button on the signup or login page
3. You should be redirected to Google's OAuth consent screen
4. After authorizing, you should be redirected back to your app

## Flow Overview

**New Users (Sign Up with Google):**
1. User clicks "Continue with Google"
2. Google OAuth flow completes
3. User is redirected to the role selection screen
4. User completes their profile
5. User is redirected to the main app

**Existing Users (Log In with Google):**
1. User clicks "Continue with Google"
2. Google OAuth flow completes
3. User is automatically redirected to the main app (if profile is complete)
4. OR redirected to role selection (if profile is incomplete)

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure the redirect URI in Google Cloud Console exactly matches the Supabase callback URL
- Check that there are no trailing slashes or extra characters

**Error: "Access blocked: This app's request is invalid"**
- Verify that your OAuth consent screen is configured correctly
- Make sure you've added all required information

**Browser shows "Unable to connect" or redirect fails**
- This is normal! The authentication actually worked.
- The app automatically captures the OAuth tokens from the URL
- You should be redirected to the app within a few seconds
- If not, close the browser tab and return to the app

**Popup blocked error**
- This is expected in some browsers, especially on web
- The app handles this automatically by capturing tokens from the URL
- Simply wait a moment and the authentication will complete

**User not redirected after sign-in**
- Check that your redirect URLs are configured correctly in both Google Cloud Console and Supabase
- For web development, ensure `http://localhost:3000` is added to Supabase Redirect URLs
- Verify that the custom URL scheme in app.json matches the one in your redirect URLs

**Profile not created after Google sign-in**
- The user profile will be automatically created by the database trigger when the user signs in
- Check the `user_profiles` table in Supabase to verify

## Security Notes

- Never commit your Google OAuth credentials to version control
- The Client Secret should only be stored in Supabase, not in your app
- Use different OAuth credentials for development and production environments
- Regularly review your authorized domains and redirect URIs

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
