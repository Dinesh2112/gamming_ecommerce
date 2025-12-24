# Supabase Database Setup Guide for Vercel Deployment

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose an organization (or create one)
5. Fill in:
   - **Project Name**: gaming-ecommerce (or your choice)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., Southeast Asia (Mumbai))
6. Click "Create new project"
7. Wait 2-3 minutes for the database to be set up

## Step 2: Get Your Database Connection String

1. In your Supabase dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll down to **Connection String** section
3. Click on **Connection Pooling** tab
4. Copy the **Connection Pooling** connection string (it looks like):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **OR** use the **Direct connection** (for migrations):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

5. Replace `[password]` with your database password

## Step 3: Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   ### For Production:
   ```
   DATABASE_URL = postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

   **Important Notes:**
   - Use **Connection Pooling** URL (port 6543) for Vercel
   - Add `?pgbouncer=true&connection_limit=1` at the end
   - Replace `[password]` with your actual database password
   - URL encode special characters in password if needed

   ### Other Required Environment Variables:
   ```
   JWT_SECRET = your-secret-key-here
   RAZORPAY_KEY_ID = your-razorpay-key-id
   RAZORPAY_KEY_SECRET = your-razorpay-secret
   GOOGLE_GENERATIVE_AI_API_KEY = your-gemini-api-key
   NODE_ENV = production
   ```

5. Click **Save** for each variable

## Step 4: Run Prisma Migrations on Supabase

You have two options:

### Option A: Run Migrations Locally (Recommended)

1. Create a `.env` file in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```
   **Note:** Use the **Direct connection** (port 5432) for migrations, NOT the pooled connection

2. Open terminal in the `backend` folder and run:
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   ```

   This will apply all your migrations to Supabase.

### Option B: Use Prisma Studio to Push Schema

1. Set DATABASE_URL in `.env` (Direct connection, port 5432)
2. Run:
   ```bash
   cd backend
   npx prisma db push
   ```

## Step 5: Verify the Connection

1. After migrations, test the connection:
   ```bash
   cd backend
   node testConnection.js
   ```

2. You should see: "Successfully connected to the database!"

## Step 6: Redeploy on Vercel

1. After adding environment variables, go to **Deployments** tab in Vercel
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Your app should now connect to Supabase!

## Step 7: Create Initial Data (Optional)

If you need to seed your database with categories/products:

1. Set DATABASE_URL in `.env` (use Direct connection)
2. Run:
   ```bash
   cd backend
   npm run seed
   ```

Or use the API endpoint after deployment:
```
GET https://your-app.vercel.app/api/products/init
```
(Requires admin authentication)

## Troubleshooting

### Error: "Can't reach database server"
- Check if your Supabase project is active
- Verify the connection string is correct
- Make sure you're using port 6543 (pooled) for Vercel, port 5432 (direct) for migrations

### Error: "Connection timeout"
- Check your Supabase project status
- Verify the region matches
- Try the Direct connection instead of Pooling

### Error: "Authentication failed"
- Double-check your database password
- URL encode special characters in password
- Make sure there are no extra spaces in the connection string

### Migrations fail
- Use Direct connection (port 5432) for migrations, NOT pooled
- Make sure Prisma schema is correct
- Check Supabase logs in the dashboard

## Security Notes

- Never commit `.env` files to Git
- Use Connection Pooling for production (better performance)
- Use Direct connection only for migrations
- Keep your database password secure
- Supabase free tier includes 500MB database storage


