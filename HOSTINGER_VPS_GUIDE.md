# Hostinger VPS Setup Guide for Vigor App

This guide walks you through setting up your Hostinger VPS to run the Vigor Mobile App and generate the QR code.

## 1. Get Your VPS Details and Login

1.  **Log in to Hostinger Dashboard**.
2.  Go to the **VPS** section.
3.  Find your VPS instance (it should say "Running").
4.  Copy your **Public IP Address** (e.g., `123.45.67.89`).
5.  Set your **Root Password** if you haven't already (in the "Settings" or "Password" tab of the VPS dashboard).

## 2. Connect via SSH

You don't need to install anything on your laptop if you are on Windows 10/11 or Mac/Linux.

1.  Open your **Command Prompt** (cmd) or **PowerShell** on your local laptop.
2.  Type the following command (replace with your actual IP):
    ```powershell
    ssh root@YOUR_VPS_IP
    ```
3.  Type `yes` if asked about "fingerprint".
4.  Enter your **Root Password** (typing will be invisible, just type and press Enter).

## 3. Run the Automated Setup

Once you are logged into the VPS (your prompt will look like `root@localhost:~#`), copy and paste these commands block by block.

### Step 3.1: Download and Run the Script

I have prepared an automation script for you. Run this:

```bash
curl -O https://raw.githubusercontent.com/Abwonder/vigor-mobile-application/main/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh
```

**What this does:**

- Installs Node.js 20, Git, and system updates.
- Installs Expo CLI and Ngrok globally.
- Clones your repository (`vigor-mobile-application`).
- Installs project dependencies.

### Step 3.2: Start the App

Once the script finishes saying "Setup Complete!", verify you are in the project folder and start the app:

```bash
cd vigor-mobile-application
npx expo start --tunnel
```

**Success!** You will see a QR code in your terminal. Screenshot it and share it.

---

## 4. Keeping it Running 24/7 (Optional)

If you close your terminal, the app will stop. To keep it running forever:

1.  **Stop the current app** (Ctrl + C).
2.  **Use PM2** (Process Manager) which was installed by my script:

    ```bash
    pm2 start "npx expo start --tunnel" --name vigor-app
    ```

    _Note: If PM2 fails to show the QR code logs easily, using `screen` is often simpler for Expo:_

    **Alternative (Screen method):**
    1.  Type `screen`.
    2.  Run `npx expo start --tunnel`.
    3.  Press `Ctrl + A`, then `D` to detach.
    4.  To verify it's running later, type `screen -r`.

## Troubleshooting

- **"Permission denied":** Make sure you are running as `root` (Hostinger default).
- **"Ngrok tunnel took too long":** If this happens on the VPS, you might need to add your auth token there too:
  ```bash
  ngrok config add-authtoken YOUR_TOKEN
  ```
