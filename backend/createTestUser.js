const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      }
    });
    
    console.log('Test user created or updated:', user);
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 