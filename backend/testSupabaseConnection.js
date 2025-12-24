const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Environment variables loaded:', {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
    });
    
    // Try to connect to the database
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    // Try a simple query
    console.log('Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Test query result:', result);
    
    // Try to get the database version
    console.log('Getting database version...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', version);
    
  } catch (error) {
    console.error('Connection error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Additional error information
    if (error.code === 'P1001') {
      console.error('Connection failed. Please check:');
      console.error('1. Database URL format is correct');
      console.error('2. Password is correct');
      console.error('3. SSL mode is enabled');
      console.error('4. IP restrictions are disabled');
      console.error('5. Database is running');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 