# 📝 Create Your .env File

Since .env files are protected, please create it manually. Follow these steps:

## Step 1: Create the File

1. Navigate to the `backend` folder in your project
2. Create a new file named `.env` (with the dot at the beginning)
3. Copy and paste the content below into it

## Step 2: Copy This Content

```env
# Database Configuration - Direct Connection (for migrations)
# Password: Dinesh@022112 (URL-encoded @ as %40)
DATABASE_URL="postgresql://postgres:Dinesh%40022112@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres"

# JWT Secret for authentication
JWT_SECRET="8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe"

# Razorpay Payment Gateway (if you have these)
# RAZORPAY_KEY_ID="your-razorpay-key-id"
# RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Google Gemini AI API Key (if you have this)
# GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Node Environment
NODE_ENV="development"
```

## Important Notes:

1. **Password encoding**: Your password `Dinesh@022112` is encoded as `Dinesh%40022112` (the `@` becomes `%40`)
2. **File location**: Must be in the `backend` folder, not the root folder
3. **File name**: Must be exactly `.env` (with the dot)
4. **No spaces**: Make sure there are no extra spaces around the `=` signs

## Quick Way to Create (Windows):

1. Open PowerShell or Command Prompt
2. Navigate to backend folder:
   ```powershell
   cd "C:\Users\Dinesh\OneDrive\Desktop\MCA first year\first year\gamming-ecommerce\backend"
   ```
3. Create the file:
   ```powershell
   @"
DATABASE_URL="postgresql://postgres:Dinesh%40022112@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres"
JWT_SECRET="8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe"
NODE_ENV="development"
"@ | Out-File -FilePath .env -Encoding utf8
   ```

Or simply create it in VS Code:
- Right-click in `backend` folder → New File → Name it `.env`
- Paste the content above
- Save

## Next Steps After Creating .env:

1. Test connection:
   ```bash
   cd backend
   node setup-supabase.js
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Get pooled connection string from Supabase for Vercel (port 6543)

