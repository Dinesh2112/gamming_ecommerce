const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    // Find all users with lowercase 'admin' role
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    });
    
    console.log(`Found ${adminUsers.length} users with lowercase 'admin' role`);
    
    // Update all admin users to uppercase 'ADMIN'
    if (adminUsers.length > 0) {
      for (const user of adminUsers) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        });
        
        console.log(`Updated user ${updatedUser.email} role to ADMIN`);
      }
    }
    
    // Also update the specific admin user directly
    const updatedUser = await prisma.user.update({
      where: { email: 'dineshrajan123@gmail.com' },
      data: { role: 'ADMIN' }
    });
    
    console.log('Direct update of admin user:', updatedUser);
  } catch (err) {
    console.error('Error updating admin role:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole(); 