# NOMADLY — API Keys & Credentials Setup Guide

This guide explains step-by-step how to obtain all external credentials for NOMADLY.

> **💡 Zero-Config Fallback / Demo Mode:**
> NOMADLY is architected with a **Dual-Mode Provider Engine**. If you do not provide external credentials, the platform will automatically run in **High-Fidelity Demo Mode** using local MongoDB, rich seeded travel catalogs (Flights, Hotels, Trains, and Buses), and an instant sandbox payment gateway. You can run, test, and present the entire full-stack application immediately without any third-party signups!

---

## 1. MongoDB Atlas (Cloud Database)

By default, NOMADLY will automatically spin up an embedded in-memory MongoDB database if `MONGODB_URI` is left blank in `backend/.env`. To connect to a live MongoDB Atlas cluster:

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create a Deployment** and select the free **M0 Shared Cluster**.
3. Choose your nearest cloud region (e.g., AWS Mumbai `ap-south-1`).
4. In **Security Quickstart**:
   - Create a database user with a username (e.g. `nomadly_admin`) and a secure password.
   - Under **Where would you like to connect from?**, select **IP Access List** and add `0.0.0.0/0` (Allow Access from Anywhere) for development.
5. Click **Connect** -> **Drivers** (Node.js).
6. Copy the connection string format:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/nomadly?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your created database credentials and paste it into `backend/.env`.

---

## 2. Firebase Authentication (Identity & Roles)

NOMADLY supports email/password, Google sign-in, and role-based access.

### Frontend Firebase Setup:
1. Visit the [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g. `nomadly-travel`).
2. Navigate to **Build -> Authentication** and click **Get Started**.
3. Under the **Sign-in method** tab, enable:
   - **Email/Password**
   - **Google** (select your support email and save)
4. Go to **Project Settings** (gear icon in the sidebar) -> **General** tab.
5. Scroll down to **Your apps**, click the **Web icon (`</>`)**, register app as `nomadly-web`.
6. Copy the `firebaseConfig` keys into `frontend/.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Backend Firebase Admin SDK Setup (Optional):
1. In the Firebase Console, go to **Project Settings -> Service Accounts**.
2. Click **Generate New Private Key**. A JSON file will download.
3. Open the JSON file and copy the fields into `backend/.env`:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...-----END PRIVATE KEY-----\n"
   ```

*(Note: In demo mode, NOMADLY comes with built-in instant login buttons for both Traveler and Administrator accounts so reviewers can test all routes without needing Firebase keys)*.

---

## 3. Razorpay Payment Gateway (Test Mode)

1. Sign up for a free developer account at [Razorpay](https://razorpay.com/).
2. In the Razorpay Dashboard, ensure the toggle at the top is set to **Test Mode**.
3. Navigate to **Account & Settings** -> **API Keys**.
4. Click **Generate Key**.
5. Copy your **Key Id** and **Key Secret**.
6. Set in `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Set the public Key ID in `frontend/.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   ```

---

## 4. Amadeus for Developers (Optional Live Flight Data)

1. Register at [Amadeus for Developers](https://developers.amadeus.com/).
2. Go to **My Self-Service Workspace** -> **Create New App**.
3. Give your app a name (e.g. `NomadlyTravelApp`).
4. Copy the **API Key** (Client ID) and **API Secret**.
5. Paste into `backend/.env`:
   ```env
   AMADEUS_CLIENT_ID=your_amadeus_api_key
   AMADEUS_CLIENT_SECRET=your_amadeus_api_secret
   ```

---

## 5. Summary Matrix of Environment Variables

| Variable | Location | Required for Demo? | Required for Production? |
|---|---|---|---|
| `MONGODB_URI` | `backend/.env` | ❌ (Uses in-memory) | ✅ (MongoDB Atlas) |
| `PORT` | `backend/.env` | ✅ (Default: 5000) | ✅ |
| `CLIENT_URL` | `backend/.env` | ✅ (Default: `http://localhost:5173`) | ✅ (Frontend URL) |
| `JWT_SECRET` | `backend/.env` | ✅ (Preset default provided) | ✅ (Change in prod) |
| `FIREBASE_PROJECT_ID` | `backend/.env` | ❌ (Demo bypass active) | ✅ |
| `RAZORPAY_KEY_ID` | `backend/.env` & `frontend/.env` | ❌ (Mock sandbox active) | ✅ (Test or Live) |
| `AMADEUS_CLIENT_ID` | `backend/.env` | ❌ (Seeded offers active) | ⭕ (Optional) |
