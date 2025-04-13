const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeUserAdmin(email) {
  try {
    console.log(`Attempting to make user with email ${email} an admin...`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`Successfully updated user ${updatedUser.name} to ADMIN role`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// The email to make admin
const email = 'dineshrajan123@gmail.com';

makeUserAdmin(email)
  .then(() => console.log('Operation completed'))
  .catch(err => console.error('Operation failed:', err)); 