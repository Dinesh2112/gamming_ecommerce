# 🔑 How to Get/Add Your Gemini API Key

## Current Situation

Your code uses `GEMINI_API_KEY` environment variable, but it's currently **missing** from your `.env` file.

## Option 1: Find Your Existing Key

### Check These Places:

1. **Backup files:**
   - Look for `.env.backup` files in the backend folder
   - Check any old environment files

2. **Google AI Studio:**
   - Go to https://aistudio.google.com/app/apikey
   - Check if you already have API keys created
   - If you see keys, copy one of them

3. **Browser saved passwords:**
   - Check if you saved it in your browser's password manager

4. **Notes/Documents:**
   - Check your notes or project documentation

## Option 2: Create a New Key

If you can't find your old key, create a new one:

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Get API Key:**
   - Click "Get API Key" or "Create API Key"
   - Select or create a Google Cloud project
   - Copy the generated key (starts with `AIza...`)

4. **Enable Gemini API:**
   - Make sure Gemini API is enabled in your Google Cloud project
   - The free tier includes generous usage limits

## Option 3: Add Key to Your .env File

Once you have your Gemini API key:

### Method 1: Manual Edit

1. Open `backend/.env` file
2. Add this line:
   ```env
   GEMINI_API_KEY="your-actual-key-here"
   ```
3. Replace `your-actual-key-here` with your real API key
4. Save the file

### Method 2: Use PowerShell Script

1. Run:
   ```powershell
   cd backend
   powershell -ExecutionPolicy Bypass -File add-gemini-key.ps1
   ```
2. Enter your API key when prompted

### Method 3: Quick Command

```powershell
cd backend
Add-Content .env "`nGEMINI_API_KEY=`"your-key-here`""
```

## Verify It Works

After adding the key, test it:

```bash
cd backend
node testGemini.js
```

You should see:
```
✅ SUCCESS with model: gemini-1.5-pro
Response: [AI response text]
```

## Add to Vercel Too!

Don't forget to add `GEMINI_API_KEY` to Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `your-actual-key-here`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
3. Redeploy

## Important Notes

- ✅ Gemini API has a **free tier** with good limits
- ✅ Keys start with `AIza` followed by 35 characters
- ✅ Never commit API keys to Git (they're in `.gitignore`)
- ✅ Use the same key for local and Vercel
- ✅ If you lose a key, you can create a new one

## Need Help?

If you share your API key with me, I can:
1. Add it to your `.env` file
2. Update Vercel instructions
3. Test it for you

Or if you prefer, just follow the steps above and let me know if you need help! 🚀

