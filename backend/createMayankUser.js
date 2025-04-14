const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createMayankUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('mayank123', 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: 'Mayank',
        email: 'mayank123@gmail.com',
        password: hashedPassword,
        role: 'user'
      }
    });
    
    console.log('Mayank user created successfully:', user);
  } catch (err) {
    console.error('Error creating Mayank user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createMayankUser(); 