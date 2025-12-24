# PowerShell script to update .env file with Session Pooler connection
# This fixes the IPv4 compatibility issue

Write-Host "🔧 Updating .env file to use Session Pooler (IPv4 compatible)..." -ForegroundColor Yellow
Write-Host ""

# Note: The user needs to get the exact connection string from Supabase dashboard
# This is a template - they should replace with actual connection string

$sessionPoolerUrl = Read-Host "Enter your Session Pooler connection string from Supabase (or press Enter to use default format)"

if ([string]::IsNullOrWhiteSpace($sessionPoolerUrl)) {
    # Try default format based on project ID
    Write-Host "Using default Session Pooler format..." -ForegroundColor Yellow
    Write-Host "If this doesn't work, get the exact string from Supabase dashboard" -ForegroundColor Yellow
    Write-Host ""
    
    # Default format - user can modify if needed
    $sessionPoolerUrl = "postgresql://postgres.cwthpewwogyukuckoytc:Dinesh%40022112@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    
    Write-Host "Using: $($sessionPoolerUrl.Replace('Dinesh%40022112', '****'))" -ForegroundColor Cyan
}

# Ensure it has the required parameters
if (-not $sessionPoolerUrl.Contains("pgbouncer=true")) {
    if ($sessionPoolerUrl.Contains("?")) {
        $sessionPoolerUrl = "$sessionPoolerUrl&pgbouncer=true&connection_limit=1"
    } else {
        $sessionPoolerUrl = "$sessionPoolerUrl?pgbouncer=true&connection_limit=1"
    }
}

# If password is not encoded, encode it
if ($sessionPoolerUrl.Contains("Dinesh@022112")) {
    $sessionPoolerUrl = $sessionPoolerUrl.Replace("Dinesh@022112", "Dinesh%40022112")
    Write-Host "✅ Password URL-encoded" -ForegroundColor Green
}

$envContent = @"
# Database Configuration - Session Pooler (IPv4 compatible)
# Password: Dinesh@022112 (URL-encoded @ as %40)
DATABASE_URL="$sessionPoolerUrl"

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
    Copy-Item .env .env.backup-session-pooler
    Write-Host "✅ Backed up existing .env to .env.backup-session-pooler" -ForegroundColor Green
}

# Write new .env
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host ""
Write-Host "✅ .env file updated with Session Pooler connection!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test connection: node setup-supabase.js" -ForegroundColor White
Write-Host "2. Run migrations: npx prisma migrate deploy" -ForegroundColor White

