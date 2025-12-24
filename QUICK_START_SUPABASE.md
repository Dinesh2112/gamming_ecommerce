# Quick Start: Connect to Supabase (5 Minutes)

## Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `gaming-ecommerce`
   - **Password**: Create strong password (SAVE IT!)
   - **Region**: Choose closest (e.g., Mumbai/Singapore)
4. Click **"Create new project"**
5. Wait 2 minutes for database setup

## Step 2: Get Connection String (1 min)

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Connection String"** section
3. Click **"Connection Pooling"** tab
4. **Copy the connection string** (looks like this):

```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

5. **Replace `[YOUR-PASSWORD]`** with your actual database password
6. **Add at the end**: `?pgbouncer=true&connection_limit=1`

Final URL should look like:
```
postgresql://postgres.xxxxx:yourpassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Step 3: Add to Vercel (1 min)

1. Go to [vercel.com](https://vercel.com) → Your project
2. **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add this variable:
   - **Name**: `DATABASE_URL`
   - **Value**: (paste the connection string from Step 2)
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **"Save"**

## Step 4: Run Migrations Locally (1 min)

1. Open terminal in your project folder
2. Create `.env` file in `backend` folder:
   ```bash
   cd backend
   ```

3. For migrations, you need the **Direct Connection** (not pooled):
   - Go back to Supabase → Settings → Database
   - Use **"URI"** tab (NOT Connection Pooling)
   - Copy that connection string
   - It uses port **5432** (not 6543)

4. Create `backend/.env` file with:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:yourpassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   ```
   (Note: Port 5432, NO pgbouncer parameters)

5. Run migrations:
   ```bash
   npm install
   npx prisma migrate deploy
   ```

   Or push schema directly:
   ```bash
   npx prisma db push
   ```

6. You should see: "All migrations have been successfully applied"

## Step 5: Redeploy on Vercel (30 sec)

1. Vercel Dashboard → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **"Redeploy"**
4. ✅ Done!

## Test It

1. After deployment, visit your app
2. Try to **Sign Up** with a new account
3. If it works, you're connected! 🎉

## Common Issues

**Error: "Can't reach database"**
- Check Supabase project is active (not paused)
- Verify connection string has correct password
- Make sure port is 6543 for Vercel (pooled connection)

**Error: "Authentication failed"**
- Password might have special characters - try URL encoding
- Double-check you copied the full connection string

**Migrations fail**
- Use **Direct Connection** (port 5432) for migrations
- Don't use pooled connection (port 6543) for migrations
- Check Supabase project is not paused

**Still not working?**
- Test connection locally: `cd backend && node setup-supabase.js`
- Check Supabase logs in dashboard
- Verify environment variables are saved in Vercel

## Summary

- ✅ **Vercel** uses: Pooled connection (port 6543) with `?pgbouncer=true&connection_limit=1`
- ✅ **Migrations** use: Direct connection (port 5432) without pgbouncer
- ✅ Connection string format: `postgresql://postgres.[ref]:[password]@[host]:[port]/postgres`

That's it! Your app should now work with Supabase! 🚀


