# Automated Expense Tracker

React + Tailwind (Vite) · Express · MongoDB · Google OAuth + Gmail API

Users sign in with Google, the server searches Gmail (read-only) for emails from Easypaisa, NayaPay, JazzCash and SadaPay, extracts the amount, and stores it. The dashboard filters by today / week / month / last 3 months / custom range, and groups the chart by day, week or month.

## 1. Google Cloud setup
1. Go to https://console.cloud.google.com and create a project.
2. **APIs & Services → Library**: enable the **Gmail API**.
3. **OAuth consent screen**: choose External, fill in the basics, add scope `.../auth/gmail.readonly`, and add your Gmail address under **Test users**.
4. **Credentials → Create credentials → OAuth client ID → Web application**.
   Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Secret.

> `gmail.readonly` is a restricted scope. While the app is in "Testing" mode it works for up to 100 test users (tokens expire every 7 days). Going public requires Google's verification.

## 2. Run it
```bash
# MongoDB must be running locally (or use an Atlas URI)
cd server && cp .env.example .env   # fill in Google keys + JWT_SECRET
npm install && npm run dev          # needs Node 20.6+

cd ../client && npm install && npm run dev
```
Open http://localhost:5173


