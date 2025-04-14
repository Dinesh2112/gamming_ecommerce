const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database`);
    
    // Print each user's information
    users.forEach(user => {
      console.log(`User ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('------------------------');
    });
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 