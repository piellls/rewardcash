# Deployment & Integration Guide: RewardCash

This document explains the steps to take this local project and put it live on the internet with a production Supabase database and a real CPA network (CPALead) integration.

---

## Step 1: Create a GitHub Repository & Push Your Code

Create a repository on GitHub (e.g. named `rewardcash`) and push your local files:

```bash
# In the terminal, inside /Users/bilal/Desktop/rewardcash:
git init
git add .
git commit -m "Initial commit: RewardCash site"
git branch -M main
git remote add origin https://github.com/your-username/rewardcash.git
git push -u origin main
```

---

## Step 2: Set Up Supabase (Database & Auth)

1. Go to [Supabase.com](https://supabase.com) and sign up/log in.
2. Click **New Project** and select a name, database password, and region.
3. Once the project is provisioned, go to the **SQL Editor** in the left sidebar.
4. Click **New Query**, copy the contents of the `schema.sql` file in this project, paste it into the editor, and click **Run**.
   - This creates the `profiles`, `completed_offers`, and `withdrawals` tables.
   - It configures Row Level Security (RLS) policies.
   - It sets up a trigger that automatically creates a user profile whenever someone registers.

---

## Step 3: Deploy to Vercel (Hosting)

1. Go to [Vercel.com](https://vercel.com) and log in using your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your `rewardcash` repository.
4. Expand the **Environment Variables** section and add the following keys from your Supabase Project Settings (Settings -> API):

| Key | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | *Your Supabase Project URL* | Public (Anon) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Your Supabase Anon Public Key* | Public (Anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | *Your Supabase Service Role Key (Keep Private!)* | Server-only |

5. Click **Deploy**. Vercel will build and launch your site live with an SSL certificate (`https`) in under a minute!

---

## Step 4: Configure the CPALead Postback

To earn money from CPALead, when a user completes a task, CPALead needs to notify your website so you can credit the user with coins.

1. Log into your **CPALead Publisher Dashboard**.
2. Go to **Postbacks** (or Tools -> Postback).
3. Set your Postback URL to point to your live Vercel domain API route:
   ```text
   https://your-vercel-domain.vercel.app/api/postback?click_id={subid}&payout={payout}&provider=cpalead
   ```
   *Note: CPALead replaces `{subid}` with the tracking ID we pass inside the offer link, and `{payout}` with the amount of money you earn from that completion.*

4. Save the configuration.

---

## Step 5: Update Your Offer Wall Links

In your production code, when creating links to CPALead offers:
- Append the logged-in user's ID as the `subid` query parameter to the offer link:
  ```text
  https://www.cpalead.com/offer-link?pub=XXXXXX&subid=USER_UUID
  ```
- When the user finishes the offer, CPALead calls your postback with `click_id=USER_UUID`.
- Your `app/api/postback/route.js` receives `USER_UUID`, fetches their profile in Supabase, credits their balance, and records the logs automatically!

---

## Production Security Reminders

> [!WARNING]
> Keep your `SUPABASE_SERVICE_ROLE_KEY` completely secret. Never commit it to GitHub or share it. Only place it in the Vercel Environment Variables. It has full admin permissions to read and write any data in your database, bypassing security checks.
