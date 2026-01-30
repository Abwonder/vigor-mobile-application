#!/bin/bash

# Vigor App VPS Setup Script (Ubuntu/Debian)

echo "🚀 Starting VPS Setup for Vigor App..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl unzip

# 2. Install Node.js 20 (LTS)
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Check Versions
echo "✅ Checking versions..."
node -v
npm -v

# 4. Install Global Tools
echo "🛠 Installing Expo CLI & Ngrok..."
sudo npm install -g expo-cli @expo/ngrok pm2

# 5. Setup Project Directory (if not already in it)
# Assuming the user clones the repo first, then runs this script inside it.
# Or if this script is run from home:
if [ ! -d "vigor-mobile-application" ]; then
    echo "⬇️ Cloning Repository..."
    git clone https://github.com/Abwonder/vigor-mobile-application.git
    cd vigor-mobile-application
else
    echo "📂 Already in (or found) vigor-mobile-application directory."
    cd vigor-mobile-application || true
fi

# 6. Install Dependencies
echo "📚 Installing Project Dependencies..."
npm install

echo "🎉 Setup Complete!"
echo "---------------------------------------------------"
echo "To start the app and get the QR code, run:"
echo "   npx expo start --tunnel"
echo ""
echo "To keep it running 24/7 in the background, use:"
echo "   pm2 start \"npx expo start --tunnel\" --name vigor-app"
echo "---------------------------------------------------"
