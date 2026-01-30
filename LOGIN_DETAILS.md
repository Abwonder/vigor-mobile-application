# Vigor App - Login & Workflow Details

This document outlines the login credentials and workflows for the different user roles in the Vigor mobile application.

## 1. Specialist / Public Health Workflow

**Status:** MOCKED LOGIN (For Demo/Development)

This workflow is for healthcare providers.

### **Getting Access:**

When signing up as a Specialist or Public Health professional, you will be prompted for an **Access Code**.

- **Access Code:** `SPN-002349`

### **Logging In:**

The specialist login screen currently accepts **any** valid email format and password for demonstration purposes.

- **Email:** `doctor@test.com` (or any email with an '@')
- **Password:** `password` (or any text)

---

## 2. Patient / Service User Workflow

**Status:** LIVE SUPABASE AUTH

This workflow is for patients receiving care.

### **Sign Up:**

1.  Open the app and select **"Create an account"**.
2.  Select **"Service User"**.
3.  Complete the sign-up form with a real (or memorable) email and password.
4.  Your account will be created in the connected Supabase backend.

### **Logging In:**

Use the **exact credentials** you created during the sign-up process.

- **Email:** _[The email you used to sign up]_
- **Password:** _[The password you set]_

---

## 3. Sponsor Workflow

**Status:** LIVE SUPABASE AUTH

This workflow is for users sponsoring a patient's care.

### **Sign Up:**

1.  Open the app and select **"Create an account"**.
2.  Select **"I'm a Sponsor"**.
3.  Complete the sign-up form.

### **Logging In:**

Use the **exact credentials** you created during the sign-up process.

- **Email:** _[The email you used to sign up]_
- **Password:** _[The password you set]_

## Troubleshooting

- If you see "Unable to login", ensure you are using the correct workflow for your role.
- Refer to `HOSTINGER_VPS_GUIDE.md` for server-side issues.
