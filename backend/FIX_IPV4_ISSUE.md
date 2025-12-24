# 🔧 Fix IPv4 Compatibility Issue

## The Problem

Your Supabase dashboard shows: **"Not IPv4 compatible"**

This means:
- The direct connection (port 5432) requires IPv6
- Your network/computer is IPv4-only
- You need to use **Session Pooler** instead

## Solution: Use Session Pooler Connection

### Step 1: Get Session Pooler Connection String

1. In the Supabase "Connect to your project" modal
2. Click **"Pooler settings"** button (shown in the warning)
3. OR go to: **Settings** → **Database** → Scroll to **"Connection String"** section
4. Look for **"Session mode"** or **"Transaction mode"** connection string
5. It should use port **6543** (not 5432)

### Step 2: Update Your .env File

The Session Pooler connection string format should be:
```
postgresql://postgres.cwthpewwogyukuckoytc:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Or:
```
postgresql://postgres.cwthpewwogyukuckoytc:[YOUR-PASSWORD]@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres?pgbouncer=true
```

### Step 3: For Migrations

**Important:** For running Prisma migrations, you have two options:

**Option A: Use Session Pooler for migrations too** (recommended)
- Use the Session Pooler connection string in .env
- Add `?pgbouncer=true&connection_limit=1` at the end
- This should work for migrations on IPv4 networks

**Option B: Use Supabase SQL Editor**
- Run migrations through Supabase dashboard SQL Editor
- Copy migration SQL files and run them there

---

## Quick Fix Steps

1. **Get Session Pooler connection string:**
   - Click "Pooler settings" in the modal
   - OR Settings → Database → Connection String → Session mode

2. **Copy the connection string**

3. **Update backend/.env:**
   - Replace DATABASE_URL with Session Pooler connection string
   - Password: Dinesh%40022112 (URL-encoded)
   - Add `?pgbouncer=true&connection_limit=1` at the end

4. **Test connection:**
   ```bash
   cd backend
   node setup-supabase.js
   ```

---

## Expected Connection String Format

After getting Session Pooler, your DATABASE_URL should look like:

```
DATABASE_URL="postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

OR

```
DATABASE_URL="postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

---

## Note

- Session Pooler uses port **6543** (not 5432)
- This is the SAME connection string you'll use for Vercel
- It's IPv4 compatible, so it will work on your network
- You can use it for both local development AND Vercel deployment

