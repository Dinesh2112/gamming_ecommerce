/**
 * Setup script to configure Supabase database connection
 * This script helps you verify your Supabase connection and run migrations
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function setupSupabase() {
  console.log('🚀 Starting Supabase Setup...\n');
  
  // Check environment variables
  console.log('📋 Checking environment variables...');
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;
  
  console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DIRECT_URL: ${hasDirectUrl ? '✅ Set' : '⚠️  Optional (recommended for migrations)'}\n`);
  
  if (!hasDatabaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file');
    console.error('\nPlease add DATABASE_URL to your .env file:');
    console.error('DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"');
    console.error('\nFor migrations, also add:');
    console.error('DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"');
    process.exit(1);
  }
  
  // Test connection
  console.log('🔌 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase!\n');
    
    // Run a test query
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 Database Info:');
    console.log(`   PostgreSQL Version: ${result[0]?.version || 'Unknown'}\n`);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Check if your Supabase project is active');
    console.error('2. Verify your DATABASE_URL is correct');
    console.error('3. Make sure your password is URL-encoded if it contains special characters');
    console.error('4. For migrations, use DIRECT_URL (port 5432), not pooled connection (port 6543)');
    process.exit(1);
  }
  
  // Check if migrations are needed
  console.log('📦 Checking Prisma migrations...');
  try {
    const migrations = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = '_prisma_migrations'
    `;
    
    if (migrations.length > 0) {
      console.log('✅ Migration table exists');
    } else {
      console.log('⚠️  No migration table found - database might be empty');
    }
  } catch (error) {
    console.log('⚠️  Could not check migrations:', error.message);
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Run migrations: npx prisma migrate deploy');
  console.log('2. Or push schema: npx prisma db push');
  console.log('3. Generate Prisma client: npx prisma generate');
  console.log('4. (Optional) Seed data: npm run seed\n');
  
  await prisma.$disconnect();
  console.log('✅ Setup check completed!');
}

// Run setup
setupSupabase()
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


