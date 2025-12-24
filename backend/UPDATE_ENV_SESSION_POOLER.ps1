# Update .env file with Session Pooler connection string (IPv4 compatible)

$envContent = @"
# Database Configuration - Session Pooler (IPv4 compatible)
# Password: Dinesh@022112 (URL-encoded @ as %40)
DATABASE_URL="postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

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

# Backup existing .env
if (Test-Path .env) {
    Copy-Item .env .env.backup-$(Get-Date -Format "yyyyMMdd-HHmmss")
    Write-Host "✅ Backed up existing .env file"
}

# Write new .env
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host "✅ .env file updated with Session Pooler connection string!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection details:" -ForegroundColor Cyan
Write-Host "  - Using Session Pooler (IPv4 compatible)" -ForegroundColor White
Write-Host "  - Host: aws-1-ap-south-1.pooler.supabase.com" -ForegroundColor White
Write-Host "  - Port: 5432" -ForegroundColor White
Write-Host "  - Password: URL-encoded" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test connection: node setup-supabase.js" -ForegroundColor White
Write-Host "2. Run migrations: npx prisma migrate deploy" -ForegroundColor White

