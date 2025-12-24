# Script to add Gemini API key to .env file

Write-Host "🔑 Adding Gemini API Key to .env file..." -ForegroundColor Cyan
Write-Host ""

# Read current .env content
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Get API key from user
$apiKey = Read-Host "Enter your Gemini API key (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "⚠️  No API key provided. Skipping..." -ForegroundColor Yellow
    exit 0
}

# Read current .env file
$envContent = Get-Content $envPath -Raw

# Check if GEMINI_API_KEY already exists
if ($envContent -match "GEMINI_API_KEY") {
    Write-Host "⚠️  GEMINI_API_KEY already exists. Updating..." -ForegroundColor Yellow
    
    # Replace existing key
    $envContent = $envContent -replace 'GEMINI_API_KEY="[^"]*"', "GEMINI_API_KEY=`"$apiKey`""
    $envContent = $envContent -replace "GEMINI_API_KEY=[^\r\n]*", "GEMINI_API_KEY=`"$apiKey`""
    
    # If still not replaced (commented line), add new line
    if ($envContent -notmatch "^\s*GEMINI_API_KEY=") {
        $envContent = $envContent.TrimEnd() + "`r`nGEMINI_API_KEY=`"$apiKey`""
    }
} else {
    # Add new key at the end
    if (-not $envContent.EndsWith("`n") -and -not $envContent.EndsWith("`r`n")) {
        $envContent += "`r`n"
    }
    $envContent += "`r`n# Google Gemini AI API Key`r`nGEMINI_API_KEY=`"$apiKey`""
}

# Write back to file
$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Gemini API key added to .env file!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the key: node testGemini.js" -ForegroundColor White
Write-Host "2. Make sure to add GEMINI_API_KEY to Vercel environment variables too!" -ForegroundColor White

