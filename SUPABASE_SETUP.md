# ⚡ Supabase + Vercel Setup Guide for RGPV Cycle Rental

This guide walks you through connecting your **Supabase PostgreSQL Database** and deploying to **Vercel** in 3 simple steps.

---

## Step 1: Get Your Supabase Database Connection String (1 Minute)

1. Log into [Supabase Dashboard](https://supabase.com/dashboard) and open or create a project (e.g. `rgpv-cycle-rental`).
2. In the left sidebar, click **Project Settings** (gear icon ⚙️) -> **Database**.
3. Scroll down to the **Connection string** section.
4. Select the **URI** tab:
   - **Mode: Transaction (Pooler - Port 6543)**:
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
     👉 **This is your `DATABASE_URL`** (used by Vercel for fast serverless queries).
   - **Mode: Session (Direct - Port 5432)**:
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
     👉 **This is your `DIRECT_URL`** (used by Prisma for pushing migrations and schema).

---

## Step 2: Set Up Supabase Storage for Cycle Photos (30 Seconds)

1. In Supabase Dashboard, click **Storage** in the left menu.
2. Click **New Bucket**.
3. Name the bucket: `bikes`
4. Toggle **Public Bucket** to **ON** (so students can view bicycle photos).
5. Click **Save**.
6. In **Project Settings** -> **API**, copy:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co` (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key**: `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Deploy on Vercel (2 Minutes)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository: `cycle-rental-platform`.
3. In the **Environment Variables** section, add:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | Your Supabase Transaction connection string (port 6543) |
| `DIRECT_URL` | Your Supabase Session connection string (port 5432) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `rgpvadmin@2026` |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | `919876543210` |
| `NEXT_PUBLIC_CAMPUS_NAME` | `RGPV Bhopal` |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | `₹` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `ey...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `ey...` |

4. Click **Deploy**. Vercel will build the project and launch it with a live `https://[your-app].vercel.app` URL!

---

## Step 4: Seed Initial RGPV Fleet Data to Supabase

Once your `.env` has your Supabase connection strings, run this one command to initialize all campus cycles, photos, stands, and admin credentials in your Supabase database:

```bash
npx prisma db push
npm run seed
```
