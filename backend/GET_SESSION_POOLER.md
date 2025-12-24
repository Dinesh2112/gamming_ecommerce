# 📋 How to Get Session Pooler Connection String

## Step-by-Step Instructions

### Method 1: From the Modal

1. In the "Connect to your project" modal you just opened
2. Click the **"Pooler settings"** button (shown in the warning)
3. This will show you the Session Pooler connection string
4. Copy that connection string

### Method 2: From Database Settings

1. Go to **Settings** → **Database**
2. Scroll down to **"Connection String"** section
3. You should see tabs: **"URI"**, **"Connection Pooling"**, etc.
4. Click on **"Connection Pooling"** tab
5. Select **"Session mode"** (not Transaction mode)
6. Copy the connection string shown

### Method 3: Direct URL Format

Based on your project ID (`cwthpewwogyukuckoytc`), try this format:

```
postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Or:

```
postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@db.cwthpewwogyukuckoytc.supabase.co:6543/postgres?pgbouncer=true
```

**Note:** Replace `ap-south-1` with your actual region if different.

---

## What You're Looking For

The Session Pooler connection string should:
- ✅ Use port **6543** (not 5432)
- ✅ Have `pooler.supabase.com` or similar in the hostname
- ✅ OR use your project domain with port 6543
- ✅ Work on IPv4 networks

---

## Once You Have It

1. Copy the exact connection string
2. Replace `[YOUR-PASSWORD]` with `Dinesh%40022112`
3. Make sure it has `?pgbouncer=true` at the end (add if missing)
4. Update your `backend/.env` file
5. Test connection: `node setup-supabase.js`

---

## Quick Update Script

Once you have the Session Pooler connection string, I can help you update the .env file automatically. Just share the connection string format you see in Supabase dashboard!

