const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function restoreAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('dinesh123', 10);
    
    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'dineshrajan123@gmail.com' }
    });
    
    if (existingUser) {
      console.log('Admin user already exists, updating password:', existingUser);
      
      // Update admin user with new password
      const updatedUser = await prisma.user.update({
        where: { email: 'dineshrajan123@gmail.com' },
        data: {
          password: hashedPassword
        }
      });
      
      console.log('Admin user updated:', updatedUser);
      return;
    }
    
    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: 'Dinesh Rajan',
        email: 'dineshrajan123@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created successfully:', user);
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdminUser(); 