# Security Update Guide: Rotating Twilio Credentials

Follow these steps immediately to secure your application.

## 1. Rotate Twilio Credentials (The Source)

1.  Log in to your [Twilio Console](https://www.twilio.com/console).
2.  Find **Account Info**.
3.  Click **Request a secondary Token** or locate the "Auth Token" field.
4.  Copy the **NEW Auth Token**.
5.  **Revoke** the old compromised token (`936b...`) if it hasn't been automatically revoked.

## 2. Update Supabase (The Backend)

Most of your phone auth logic lives here.

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to **Authentication** > **Providers** > **Phone**.
3.  Scroll down to **Twilio Settings**.
4.  Update the **Twilio Auth Token** field with your **NEW** token.
5.  Click **Save**.

## 3. Update VPS (The Server)

If your backend code (Edge Functions) uses these credentials, update the server environment.

1.  SSH into your VPS:
    ```bash
    ssh root@72.62.213.46
    ```
2.  Open your `.env` file:

    ```bash
    nano .env
    ```

    _(If the file is empty or doesn't exist, create it)._

3.  Update (or add) the line with your **NEW** token:

    ```bash
    TWILIO_AUTH_TOKEN=your_new_token_here
    ```

4.  Save and Exit:
    - Press `Ctrl+O`, then `Enter`
    - Press `Ctrl+X`

5.  Restart your application to apply changes:
    ```bash
    pm2 restart vigor-app
    ```

## 4. Verify

Try to sign up or log in with a phone number in your app. If you receive the SMS code, the update was successful!
