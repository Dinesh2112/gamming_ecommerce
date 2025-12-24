# 🔧 Troubleshooting Supabase Connection

## Current Status
- ✅ .env file updated with Supabase connection string
- ✅ Password correctly URL-encoded (Dinesh@022112 → Dinesh%40022112)
- ❌ Connection test failed

## Possible Issues & Solutions

### Issue 1: Supabase Project is Paused

**Check:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project
3. Check if it shows "Paused" - if yes, click "Restore" or "Resume"

**Solution:** Restore/resume your Supabase project if it's paused

---

### Issue 2: Wrong Connection String Format

Supabase sometimes provides connection strings in different formats. Let's verify the correct one:

**Steps to get correct connection string:**

1. Go to Supabase Dashboard → Your Project
2. Click **Settings** ⚙️ → **Database**
3. Scroll to **"Connection String"** section
4. Click **"URI"** tab (NOT Connection Pooling)
5. You should see a connection string like one of these formats:

   **Format A:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

   **Format B:**
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

6. Copy the exact connection string shown
7. Replace `[YOUR-PASSWORD]` with your actual password (Dinesh@022112)
8. **URL-encode the password**: `Dinesh@022112` → `Dinesh%40022112`

---

### Issue 3: IP Restrictions / Network Issues

**Check:**
1. Go to Supabase Dashboard → Settings → Database
2. Check **"Connection Pooling"** settings
3. See if there are any IP restrictions enabled

**Solution:** 
- For local development, you might need to disable IP restrictions temporarily
- Or add your IP address to allowed list

---

### Issue 4: Using Wrong Port

**Current setup:** Using port 5432 (Direct connection) ✅ Correct for migrations

**If using pooled connection by mistake:**
- Pooled connection uses port 6543
- Direct connection uses port 5432
- For migrations, always use DIRECT (5432)

---

## Step-by-Step Fix

### Option A: Get Fresh Connection String from Supabase

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Get Direct Connection String**
   - Settings → Database
   - Scroll to "Connection String"
   - Click "URI" tab
   - Copy the connection string

3. **Update .env file**
   - Open `backend/.env`
   - Replace the DATABASE_URL line with the new connection string
   - Make sure to:
     - Replace `[YOUR-PASSWORD]` with `Dinesh%40022112` (URL-encoded)
     - Keep port 5432
     - Keep it in quotes: `DATABASE_URL="..."`

4. **Test again:**
   ```bash
   cd backend
   node setup-supabase.js
   ```

---

### Option B: Use Connection Pooling for Testing

Sometimes direct connection has issues. Try using pooled connection temporarily:

1. Go to Supabase Dashboard → Settings → Database
2. Click **"Connection Pooling"** tab
3. Copy that connection string
4. It should use port 6543
5. Add `?pgbouncer=true&connection_limit=1` at the end
6. Update .env with this connection string
7. Test connection

**Note:** Use pooled (6543) for Vercel, but direct (5432) is preferred for migrations

---

## Quick Test Script

Run this to see what connection string format Supabase expects:

```bash
cd backend
node verify-env.js
```

Then try connecting:
```bash
node setup-supabase.js
```

---

## Expected Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Can't reach database server` | Connection timeout | Check project is active, verify hostname |
| `Authentication failed` | Wrong password | Check password encoding, verify password is correct |
| `Connection refused` | Port/firewall issue | Check port (5432), verify network access |
| `Database does not exist` | Wrong database name | Should be `postgres` (default) |

---

## Still Not Working?

1. **Double-check your Supabase project is active**
   - Dashboard should show "Active" status
   - Not "Paused" or "Archived"

2. **Verify connection string format**
   - Copy directly from Supabase dashboard
   - Don't modify the format
   - Only replace `[YOUR-PASSWORD]` with URL-encoded password

3. **Try from Supabase SQL Editor**
   - Go to SQL Editor in Supabase dashboard
   - If you can run queries there, your project is active
   - The connection string should work then

4. **Check Supabase status page**
   - Visit status.supabase.com
   - Check if there are any outages

---

## Alternative: Use Supabase Client Instead

If Prisma connection keeps failing, we can temporarily use Supabase client for testing, but Prisma is still recommended for your app structure.

---

## Next Steps Once Connected

Once connection works:
1. ✅ Test connection: `node setup-supabase.js`
2. ⏳ Run migrations: `npx prisma migrate deploy`
3. ⏳ Get pooled connection string for Vercel
4. ⏳ Add to Vercel environment variables
5. ⏳ Redeploy on Vercel

Let me know what error you see and we'll fix it! 🚀

