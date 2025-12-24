# 🔗 Your Supabase Connection Setup

## Your Connection String

You have this connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres
```

---

## Step 1: Replace [YOUR-PASSWORD]

Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

**Example:**
If your password is `MySecurePass123!`, your connection string becomes:
```
postgresql://postgres:MySecurePass123!@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres
```

**⚠️ Important:** If your password contains special characters (like `!`, `@`, `#`, `%`, etc.), you need to URL-encode them:

| Character | URL Encoded |
|-----------|-------------|
| `!` | `%21` |
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `*` | `%2A` |
| `+` | `%2B` |
| `=` | `%3D` |

---

## Step 2: Get Pooled Connection String (For Vercel)

You need a **different** connection string for Vercel (Connection Pooling):

1. Go to Supabase Dashboard
2. **Settings** ⚙️ → **Database**
3. Scroll to **"Connection String"** section
4. Click **"Connection Pooling"** tab
5. You'll see a URL that looks like:
   ```
   postgresql://postgres.cwthpewwogyukuckoytc:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.cwthpewwogyukuckoytc:[YOUR-PASSWORD]@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres
   ```

6. Replace `[YOUR-PASSWORD]` with your password
7. Add these parameters at the end: `?pgbouncer=true&connection_limit=1`

**Final pooled connection string should look like:**
```
postgresql://postgres.cwthpewwogyukuckoytc:YourPassword@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## Step 3: Create Local .env File

Create a file `backend/.env` with this content:

```env
# Direct connection (for migrations) - Port 5432
DATABASE_URL="postgresql://postgres:YourActualPassword@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres"

# JWT Secret (use any random string)
JWT_SECRET="8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe"

# Razorpay (if you have it)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Google Gemini AI (if you have it)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Node Environment
NODE_ENV="development"
```

**Replace `YourActualPassword` with your real password!**

---

## Step 4: Test Connection Locally

1. Open terminal in `backend` folder:
   ```bash
   cd backend
   ```

2. Run the test script:
   ```bash
   node setup-supabase.js
   ```

3. You should see: ✅ Successfully connected to Supabase!

---

## Step 5: Run Migrations

After connection works, create your database tables:

```bash
cd backend
npx prisma migrate deploy
```

Or:
```bash
npx prisma db push
```

You should see: "All migrations have been successfully applied" ✅

---

## Step 6: Add to Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**

2. Add this variable:
   - **Name**: `DATABASE_URL`
   - **Value**: (Use the **POOLED connection string** from Step 2 - port 6543)
   - **Environments**: ✅ Production ✅ Preview ✅ Development

3. Also add other required variables:
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID` (if using)
   - `RAZORPAY_KEY_SECRET` (if using)
   - `GOOGLE_GENERATIVE_AI_API_KEY` (if using)

4. Click **Save**

---

## Step 7: Redeploy on Vercel

1. Vercel Dashboard → **Deployments**
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment

---

## Quick Reference

| Purpose | Connection String Format | Port |
|---------|-------------------------|------|
| **Local Migrations** | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` | 5432 |
| **Vercel Production** | `postgresql://postgres.xxx:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1` | 6543 |

---

## Your Specific Setup

**Your project reference:** `cwthpewwogyukuckoytc`

**Direct Connection (for migrations):**
```
postgresql://postgres:YOUR_PASSWORD@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres
```

**Pooled Connection (for Vercel):**
```
postgresql://postgres.cwthpewwogyukuckoytc:YOUR_PASSWORD@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

(Replace `YOUR_PASSWORD` with your actual password in both!)

---

## ✅ Checklist

- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Created `backend/.env` file with direct connection
- [ ] Tested connection locally (`node setup-supabase.js`)
- [ ] Ran migrations successfully (`npx prisma migrate deploy`)
- [ ] Got pooled connection string from Supabase dashboard
- [ ] Added `DATABASE_URL` to Vercel (using pooled connection)
- [ ] Added other environment variables to Vercel
- [ ] Redeployed on Vercel
- [ ] Tested signup/login on live app

---

You're almost done! Just follow these steps and your app will be connected! 🚀

