// Script to check database tables and schema
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  console.log('🔍 Checking database tables and schema...');
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    const testResult = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', testResult);
    
    // Check if AI tables exist
    console.log('\nChecking if AI tables exist...');
    
    // Get all table names
    const tableNames = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log('Tables in database:', tableNames.map(t => t.table_name));
    
    // Check if the required tables exist
    const requiredTables = ['AIChat', 'AIMessage', 'ProductReference'];
    const lowercaseTableNames = tableNames.map(t => t.table_name.toLowerCase());
    
    for (const table of requiredTables) {
      const exists = lowercaseTableNames.includes(table.toLowerCase());
      console.log(`Table ${table}: ${exists ? '✅ Exists' : '❌ Missing'}`);
    }
    
    // Check User table structure
    console.log('\nChecking User table structure...');
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='User' AND table_schema='public'
    `;
    console.log('User table columns:', userColumns);
    
    // Check AIChat table structure if it exists
    if (lowercaseTableNames.includes('aichat')) {
      console.log('\nChecking AIChat table structure...');
      const aiChatColumns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='AIChat' AND table_schema='public'
      `;
      console.log('AIChat table columns:', aiChatColumns);
      
      // Check if there are any chats in the table
      const chatCount = await prisma.aIChat.count();
      console.log(`Number of chats in AIChat table: ${chatCount}`);
      
      if (chatCount > 0) {
        // Get a sample chat
        const sampleChat = await prisma.aIChat.findFirst({
          include: {
            messages: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        console.log('Sample chat:', JSON.stringify(sampleChat, null, 2));
      }
    }
    
    // Check if there are any users in the database
    console.log('\nChecking users in the database...');
    const userCount = await prisma.user.count();
    console.log(`Number of users in User table: ${userCount}`);
    
    if (userCount > 0) {
      // Get a sample user
      const sampleUser = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      console.log('Sample user:', sampleUser);
    }
    
    console.log('\n✅ Database check completed!');
  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabase(); 