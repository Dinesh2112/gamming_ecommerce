# PowerShell script to update .env file with Supabase connection
# Run this script from the backend folder

$envContent = @"
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
"@

# Backup existing .env if it exists
if (Test-Path .env) {
    Copy-Item .env .env.backup
    Write-Host "✅ Backed up existing .env to .env.backup"
}

# Write new .env file
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host "✅ .env file updated with Supabase connection string!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test connection: node setup-supabase.js"
Write-Host "2. Run migrations: npx prisma migrate deploy"

