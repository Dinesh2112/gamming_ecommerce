const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Function to sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to retry an operation with exponential backoff
async function retryWithBackoff(operation, maxRetries = 10) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error.message);
      
      if (retries === maxRetries - 1) {
        throw error; // Last retry failed, throw the error
      }
      
      // Calculate backoff time: 2^retries * 1000ms (1s, 2s, 4s, 8s, etc.) up to 30s max
      const backoffTime = Math.min(Math.pow(2, retries) * 1000, 30000);
      console.log(`Retrying in ${backoffTime / 1000} seconds...`);
      await sleep(backoffTime);
      retries++;
    }
  }
}

// Make sure schema file exists
function checkPrismaSchema() {
  const schemaPath = './prisma/schema.prisma';
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Prisma schema file not found at:', schemaPath);
    console.log('Current directory:', process.cwd());
    console.log('Directory contents:', fs.readdirSync('.'));
    
    if (fs.existsSync('./prisma')) {
      console.log('Prisma directory contents:', fs.readdirSync('./prisma'));
    }
    
    throw new Error('Prisma schema file not found');
  }
  
  console.log('Prisma schema file found at:', schemaPath);
  return true;
}

// Initialize the Prisma client
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  errorFormat: 'pretty'
});

// Main setup function
async function setupDatabase() {
  console.log('Starting database setup...');
  console.log('Database URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'Not set');
  console.log('Current directory:', process.cwd());
  
  // Check if Prisma schema file exists
  checkPrismaSchema();
  
  try {
    // Try to connect to the database, but continue even if it fails
    try {
      // Test database connection with retry
      await retryWithBackoff(async () => {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('Database connection successful!');
        
        // Quick test query
        const result = await prisma.$executeRaw`SELECT 1`;
        console.log('Test query successful:', result);
        return true;
      });
      
      // Push schema changes with retry
      await retryWithBackoff(async () => {
        console.log('Pushing schema changes...');
        
        // Using child_process to run Prisma CLI commands with proper output
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('Schema pushed successfully!');
        
        return true;
      });
      
      // Create initial data
      await retryWithBackoff(async () => {
        console.log('Checking if product data exists...');
        const productCount = await prisma.product.count();
        
        if (productCount > 0) {
          console.log(`Found ${productCount} existing products, skipping seeding`);
          return true;
        }
        
        console.log('Seeding database with initial data...');
        
        // Create a GPU category if it doesn't exist
        const gpuCategory = await prisma.category.upsert({
          where: { name: 'GPUs' },
          update: {},
          create: {
            name: 'GPUs',
            description: 'Graphics Processing Units for gaming and professional use'
          }
        });
        console.log('Created or found GPU category:', gpuCategory.id);
        
        // Create a test product
        const testProduct = await prisma.product.create({
          data: {
            name: 'NVIDIA GeForce RTX 3080',
            description: 'High-end graphics card for 4K gaming and content creation',
            price: 69999,
            imageUrl: '/images/products/rtx3080.jpg',
            stock: 15,
            categoryId: gpuCategory.id,
            brand: 'NVIDIA',
            model: 'RTX 3080',
            additionalSpecs: {
              architecture: 'Ampere',
              memoryType: 'GDDR6X',
              cores: 8704,
              vram: 10
            },
            tags: ['RTX', '4K Gaming', 'Ray Tracing', 'DLSS', 'VR Ready']
          }
        });
        console.log('Created test product:', testProduct.id);
        
        return true;
      });
      
      console.log('Database setup completed successfully!');
    } catch (dbError) {
      console.error('Database setup encountered errors:', dbError);
      console.log('Continuing with server startup anyway...');
    }
    
    // Always proceed to start the server, even if DB setup fails
    return true;
  } catch (error) {
    console.error('Fatal error during setup:', error);
    // Don't exit with error - let the server start anyway
    return false;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
  }
}

// If this file is run directly, perform setup and exit
if (require.main === module) {
  setupDatabase().then(success => {
    console.log('Setup script completed with status:', success ? 'success' : 'with errors');
    // Don't exit the process with error code, let the server start
  });
}

module.exports = { setupDatabase, retryWithBackoff }; 