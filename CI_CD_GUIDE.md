# CI/CD Guide for Expo Apps (EAS Build & Update)

This guide details how to set up a Continuous Integration/Continuous Deployment (CI/CD) pipeline for your Expo app.
This setup allows you to:

1.  **Develop locally**: Use `npx expo start` for immediate feedback.
2.  **Push to Cloud**: Commit changes to GitHub (or other Git provider).
3.  **Automated Builds**: Have Expo EAS (Expo Application Services) build your app in the cloud.
4.  **Share via QR Code**: Generate a QR code for testers to scan and run the app on their devices (without needing a computer).

## Prerequisites

1.  **Expo Account**: purely for the build service. [Sign up here](https://expo.dev/signup).
2.  **EAS CLI**: The command line tool for interacting with EAS.
    ```bash
    npm install -g eas-cli
    ```
3.  **Git Repository**: Your project must be a git repository (checked: it is).

## Phase 1: Configure EAS (One-time Setup)

1.  **Login to EAS**:
    Run this in your terminal:

    ```bash
    eas login
    ```

2.  **Configure Project**:
    Run this in your root directory (`FullyMergedVigorApp`):

    ```bash
    eas build:configure
    ```

    - Select `All` or `Android/iOS` depending on your needs.
    - This creates an `eas.json` file. This file controls your build profiles (development, preview, production).

3.  **Create a 'Preview' Profile**:
    Open `eas.json` and ensure you have a `preview` profile. It usually looks like this:
    ```json
    {
      "build": {
        "preview": {
          "distribution": "internal",
          "android": {
            "buildType": "apk"
          }
        },
        "production": {}
      }
    }
    ```
    _Note: `distribution: internal` creates a build you can install directly on devices registered to your Expo organization. For easiest sharing on Android, `buildType: apk` generates a file anyone can install._

## Phase 2: Manual Cloud Build (To verify setup)

Before automating, try running a build manually to ensure everything works.

```bash
eas build --profile preview
```

- This will upload your code to Expo's servers.
- It will build the app (this can take 15-30 mins).
- **Result**: You will get a QR code and a link to install the app. You can send this link/QR code to your testers.

## Phase 3: Automated CI/CD with GitHub Actions

To automate this so it happens every time you push code, use GitHub Actions.

1.  **Get your EXPO_TOKEN**:
    - Go to [Expo Access Tokens](https://expo.dev/settings/access-tokens).
    - Create a new token.
    - Copy it.

2.  **Add Secret to GitHub**:
    - Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
    - Create a new repository secret named `EXPO_TOKEN`.
    - Paste your token.

3.  **Create Workflow File**:
    - Create a file at `.github/workflows/eas-build.yml` in your project.
    - Paste the following content:

    ```yaml
    name: EAS Build
    on:
      workflow_dispatch: # Allows manual triggering
      push:
        branches:
          - main # Or 'master', whichever is your default

    jobs:
      build:
        name: Install and Build
        runs-on: ubuntu-latest
        steps:
          - name: 🔍 Check for EXPO_TOKEN
            run: |
              if [ -z "${{ secrets.EXPO_TOKEN }}" ]; then
                echo "You must provide an EXPO_TOKEN secret linked to this project's Expo account in this repo's secrets. https://docs.expo.dev/eas/using-eas-cli-with-ci/#github-actions"
                exit 1
              fi

          - name: 🏗 Setup Repo
            uses: actions/checkout@v3

          - name: re-configure git safe directory
            run: git config --global --add safe.directory $GITHUB_WORKSPACE

          - name: 🏗 Setup Node
            uses: actions/setup-node@v3
            with:
              node-version: 18.x
              cache: npm

          - name: 🏗 Setup EAS
            uses: expo/expo-github-action@v8
            with:
              eas-version: latest
              token: ${{ secrets.EXPO_TOKEN }}

          - name: 📦 Install dependencies
            run: npm install

          - name: 🚀 Build App (Preview)
            run: eas build --platform android --profile preview --non-interactive
    ```

## Phase 4: Using the Workflow

1.  Make changes to your code locally.
2.  Commit and push to GitHub.
    ```bash
    git add .
    git commit -m "feat: updated login screen"
    git push origin main
    ```
3.  Go to the "Actions" tab in your GitHub repository.
4.  You will see the "EAS Build" workflow running.
5.  When it finishes, click on the build details in the Expo Dashboard (linked in the logs), or check your email. You will have a QR code/link to share.

## Fast Updates (EAS Update)

For small changes (JavaScript/Styles only), you don't need a full build (which takes 20 mins). You can use "EAS Update".

1.  **Configure Updates**:
    ```bash
    eas update:configure
    ```
2.  **Publish Update**:
    ```bash
    eas update --branch preview --message "fixing typo"
    ```
    _This generates a QR code instantly that testers can scan using the 'Expo Go' app or your custom Development Build._

## Summary

| Goal                          | Command/Action                | Time     |
| :---------------------------- | :---------------------------- | :------- |
| **Local Dev**                 | `npx expo start`              | Instant  |
| **Share New Native Features** | `eas build --profile preview` | ~20 mins |
| **Share JS Changes**          | `eas update`                  | ~1 min   |
