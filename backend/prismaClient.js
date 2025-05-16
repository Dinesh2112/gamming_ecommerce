const { PrismaClient } = require('@prisma/client');

// Create Prisma client with connection retry logic
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Add connection timeout
    __internal: {
      engine: {
        connectionTimeout: 10000, // 10 seconds
      }
    }
  });
};

// Create a global variable to store the Prisma client instance
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || prismaClientSingleton();

// Handle connection issues with a wrapper function
async function prismaOperation(operation) {
  try {
    // Try executing the operation
    return await operation();
  } catch (error) {
    // Handle specific Prisma errors related to database connections
    if (
      error.message.includes('Server has closed the connection') ||
      error.message.includes('Connection refused') ||
      error.message.includes('Connection terminated unexpectedly')
    ) {
      console.log('Database connection issue detected, attempting to reconnect...');
      
      // Try to reconnect
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('Successfully reconnected to the database');
        
        // Retry the operation
        return await operation();
      } catch (reconnectError) {
        console.error('Failed to reconnect to the database:', reconnectError);
        throw error; // Re-throw the original error if reconnection fails
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Assign to global for reuse
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = { prisma, prismaOperation }; 