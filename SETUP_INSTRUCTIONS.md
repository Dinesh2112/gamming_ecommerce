# 🚀 Complete Setup Guide: Connect Supabase to Your Vercel App

## Overview
Your app uses Prisma with PostgreSQL. Supabase provides free PostgreSQL hosting perfect for Vercel deployment.

---

## 📋 Step-by-Step Instructions

### STEP 1: Create Supabase Account & Project

1. **Visit** [https://supabase.com](https://supabase.com)
2. **Sign up** (use GitHub, Google, or email)
3. Click **"New Project"** button
4. Fill in the form:
   ```
   Project Name: gaming-ecommerce
   Database Password: [CREATE STRONG PASSWORD - SAVE THIS!]
   Region: Choose closest to you (Mumbai, Singapore, etc.)
   ```
5. Click **"Create new project"**
6. Wait 2-3 minutes for database setup

---

### STEP 2: Get Your Connection Strings

You need **TWO** connection strings:

#### A) Connection Pooling (For Vercel Production)
1. In Supabase Dashboard, go to **Settings** ⚙️ → **Database**
2. Scroll to **"Connection String"** section
3. Click **"Connection Pooling"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Add these parameters at the end: `?pgbouncer=true&connection_limit=1`

**Example:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### B) Direct Connection (For Migrations)
1. Still in **Settings** → **Database**
2. Click **"URI"** tab (NOT Connection Pooling)
3. Copy that connection string
4. Replace `[YOUR-PASSWORD]` with your password
5. **Don't add any extra parameters** - use it as is

**Example:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

**Key Difference:**
- Pooled: Port **6543** (for production/Vercel)
- Direct: Port **5432** (for migrations)

---

### STEP 3: Add Environment Variables to Vercel

1. Go to [vercel.com](https://vercel.com) → Login
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add these variables one by one:

   #### Variable 1: DATABASE_URL
   ```
   Name: DATABASE_URL
   Value: [PASTE POOLED CONNECTION STRING FROM STEP 2A]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   #### Variable 2: JWT_SECRET
   ```
   Name: JWT_SECRET
   Value: [any-random-string-like-this-8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   #### Variable 3: RAZORPAY_KEY_ID (if you have Razorpay)
   ```
   Name: RAZORPAY_KEY_ID
   Value: [your-razorpay-key]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   #### Variable 4: RAZORPAY_KEY_SECRET
   ```
   Name: RAZORPAY_KEY_SECRET
   Value: [your-razorpay-secret]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   #### Variable 5: GOOGLE_GENERATIVE_AI_API_KEY (for AI assistant)
   ```
   Name: GOOGLE_GENERATIVE_AI_API_KEY
   Value: [your-gemini-api-key]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

6. Click **"Save"** after adding each variable

---

### STEP 4: Run Database Migrations Locally

You need to run migrations **once** to create all tables in Supabase.

1. Open terminal/command prompt
2. Navigate to your project:
   ```bash
   cd "C:\Users\Dinesh\OneDrive\Desktop\MCA first year\first year\gamming-ecommerce\backend"
   ```

3. Create a `.env` file in the `backend` folder:
   ```bash
   # On Windows PowerShell:
   New-Item -Path .env -ItemType File
   
   # Or create it manually in VS Code/notepad
   ```

4. Open `.env` file and add this line (use **DIRECT connection** from Step 2B):
   ```env
   DATABASE_URL="postgresql://postgres.abcdefghijklmnop:yourpassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   ```
   ⚠️ **Important:** Use port **5432** (direct connection), NOT 6543

5. Install dependencies (if not already done):
   ```bash
   npm install
   ```

6. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
   
   Or if that doesn't work, use:
   ```bash
   npx prisma db push
   ```

7. You should see: **"All migrations have been successfully applied"** ✅

---

### STEP 5: Test Connection (Optional but Recommended)

1. In the `backend` folder, run:
   ```bash
   node setup-supabase.js
   ```

2. You should see: **"✅ Successfully connected to Supabase!"**

---

### STEP 6: Redeploy on Vercel

1. Go to Vercel Dashboard → **Deployments** tab
2. Find your latest deployment
3. Click **⋯** (three dots menu)
4. Click **"Redeploy"**
5. Wait for deployment to complete

---

### STEP 7: Test Your App

1. Visit your Vercel app URL
2. Try to **Sign Up** with a new account
3. If signup works, **you're connected!** 🎉

---

## 🔧 Troubleshooting

### ❌ Error: "Can't reach database server"
**Solution:**
- Check if Supabase project is active (not paused)
- Verify connection string has correct password
- Make sure you're using pooled connection (port 6543) for Vercel

### ❌ Error: "Authentication failed"
**Solution:**
- Password might have special characters - try URL encoding them
- Double-check you copied the entire connection string
- Make sure password matches exactly (case-sensitive)

### ❌ Migrations fail
**Solution:**
- Use **Direct Connection** (port 5432) for migrations
- DON'T use pooled connection (port 6543) for migrations
- Check Supabase project is not paused

### ❌ App works locally but not on Vercel
**Solution:**
- Verify environment variables are saved in Vercel
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables

### ❌ Connection timeout
**Solution:**
- Check Supabase project status in dashboard
- Verify region matches
- Try the Direct connection string instead

---

## 📝 Quick Reference

| Purpose | Connection Type | Port | URL Format |
|---------|----------------|------|------------|
| **Vercel Production** | Pooled | 6543 | `postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1` |
| **Migrations** | Direct | 5432 | `postgresql://...:5432/postgres` |

---

## ✅ Checklist

- [ ] Created Supabase account
- [ ] Created Supabase project
- [ ] Got Connection Pooling URL (port 6543)
- [ ] Got Direct Connection URL (port 5432)
- [ ] Added DATABASE_URL to Vercel environment variables
- [ ] Added JWT_SECRET to Vercel
- [ ] Added other required environment variables
- [ ] Created `.env` file locally with Direct connection
- [ ] Ran migrations successfully (`npx prisma migrate deploy`)
- [ ] Tested connection (`node setup-supabase.js`)
- [ ] Redeployed on Vercel
- [ ] Tested signup/login on live app

---

## 🎯 Summary

**What you did:**
1. ✅ Set up Supabase PostgreSQL database (free)
2. ✅ Connected your Prisma app to Supabase
3. ✅ Added environment variables to Vercel
4. ✅ Ran database migrations
5. ✅ Deployed everything

**Your app now has:**
- ✅ Persistent database (users, products, orders stored)
- ✅ User authentication working
- ✅ All data saved properly
- ✅ Production-ready setup

---

## 🆘 Need Help?

If something doesn't work:
1. Check Supabase dashboard → Database → Connection Pooling for the correct URL
2. Verify all environment variables in Vercel
3. Check Vercel deployment logs for errors
4. Test connection locally first: `node setup-supabase.js`

Good luck! 🚀


