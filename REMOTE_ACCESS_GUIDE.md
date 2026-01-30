# Sharing Your Expo App Remotely

You asked if you can run the app on a VPS to share the QR code with others. **Yes, you can**, but there is a **much faster and free way** to do this directly from your laptop without buying a VPS.

## Option 1: The "Tunnel" Method (Recommended & Free)

You can expose your _local_ development server to the internet instantly.

1.  **Install ngrok** (global dependency):

    ```powershell
    npm install -g @expo/ngrok
    ```

2.  **Start Expo with Tunneling**:
    Instead of just running `npx expo start`, run:

    ```powershell
    npx expo start --tunnel
    ```

3.  **Share**:
    - The terminal will generate a QR code.
    - Screenshot it and send it to your testers.
    - **Note**: Testers must have the **Expo Go** app installed on their phones.

**Pros:** Free, zero setup, runs on your current laptop.
**Cons:** App stops working if you close your laptop.

---

## Option 2: The VPS Method (Your Request)

If you want the app to stay online 24/7 even when your laptop is off, use a VPS.

### 1. 🛒 Buy a VPS

Get a cheap Linux VPS (e.g., Ubuntu 22.04) from DigitalOcean, Linode, or Hetzner.

### 2. 💻 Setup Node.js & Git

SSH into your VPS and run:

```bash
# Update and install tools
sudo apt update && sudo apt install -y git

# Install Node.js (Version 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Expo CLI
sudo npm install -g expo-cli
```

### 3. 📥 Clone & Install

```bash
git clone https://github.com/Abwonder/vigor-mobile-application.git
cd vigor-mobile-application
npm install
```

### 4. 🚀 Run & Share

You still need to use `--tunnel` on the VPS because opening ports 19000/8081 correctly through firewalls can be tricky for Expo.

```bash
npx expo start --tunnel
```

- Take a screenshot of the terminal QR code.
- Note: To keep it running when you disconnect SSH, use a tool like `screen` or `pm2`.

**Using `screen` to keep it alive:**

1.  Run `screen`
2.  Run `npx expo start --tunnel`
3.  Press `Ctrl + A`, then `D` to detach (it keeps running in background).
4.  To get back to it: `screen -r`.
