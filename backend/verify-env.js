/**
 * Quick script to verify .env file has correct DATABASE_URL
 */

require('dotenv').config();

console.log('🔍 Checking .env file configuration...\n');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  console.error('\nPlease add this to your backend/.env file:');
  console.error('DATABASE_URL="postgresql://postgres:Dinesh%40022112@db.cwthpewwogyukuckoytc.supabase.co:5432/postgres"');
  console.error('\n(Note: Password Dinesh@022112 is encoded as Dinesh%40022112)');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
console.log('✅ DATABASE_URL is set');

// Check if password is encoded correctly
if (dbUrl.includes('Dinesh@022112')) {
  console.warn('⚠️  WARNING: Password contains @ symbol but should be URL-encoded as %40');
  console.warn('   Current: Dinesh@022112');
  console.warn('   Should be: Dinesh%40022112');
  console.warn('\nPlease update your .env file to use URL-encoded password');
} else if (dbUrl.includes('Dinesh%40022112')) {
  console.log('✅ Password is correctly URL-encoded');
} else {
  console.log('ℹ️  Password format detected (might be different)');
}

// Show masked URL (hide password)
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log(`📋 Connection string: ${maskedUrl}`);

// Check if it's the correct format
if (dbUrl.includes('db.cwthpewwogyukuckoytc.supabase.co')) {
  console.log('✅ Using correct Supabase hostname');
} else {
  console.warn('⚠️  Hostname might be incorrect');
}

if (dbUrl.includes(':5432/postgres')) {
  console.log('✅ Using direct connection (port 5432) - correct for migrations');
} else if (dbUrl.includes(':6543/postgres')) {
  console.warn('⚠️  Using pooled connection (port 6543) - use this for Vercel, use direct (5432) for migrations');
} else {
  console.log('ℹ️  Port not detected');
}

console.log('\n✅ .env file looks good!');
console.log('\n📝 Next steps:');
console.log('1. Test connection: node setup-supabase.js');
console.log('2. Run migrations: npx prisma migrate deploy');

