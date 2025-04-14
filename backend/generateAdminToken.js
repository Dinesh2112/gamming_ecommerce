const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateAdminToken() {
  try {
    // Find the admin user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 1 },
          { email: 'dineshrajan123@gmail.com' }
        ]
      }
    });

    if (!user) {
      console.log('Admin user not found!');
      return;
    }

    console.log('Found user:', user);

    // Force update role to ADMIN if it's not already
    if (user.role !== 'ADMIN') {
      console.log('Updating user role from', user.role, 'to ADMIN');
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
      console.log('User role updated to ADMIN');
    }

    // Use JWT_SECRET from environment variable or fallback to a hardcoded value
    const jwtSecret = process.env.JWT_SECRET || '8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe';
    
    // Generate a JWT token for the user with uppercase role
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: 'ADMIN' // Explicitly set to uppercase ADMIN
      }, 
      jwtSecret, 
      {
        expiresIn: "24h", // Token expires in 24 hours
      }
    );

    console.log('New token generated:');
    console.log(token);
    
    // Decode and check token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded token payload:', decoded);
    console.log('Role in token:', decoded.role);
    console.log('Is role ADMIN?', decoded.role === 'ADMIN');
    
    console.log('\nUse this token for testing:');
    console.log(token);
  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateAdminToken(); 