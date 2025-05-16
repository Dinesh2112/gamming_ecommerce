const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Function to sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to retry an operation with exponential backoff
async function retryWithBackoff(operation, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error.message);
      
      if (retries === maxRetries - 1) {
        throw error; // Last retry failed, throw the error
      }
      
      // Calculate backoff time: 2^retries * 1000ms (1s, 2s, 4s, 8s, etc.)
      const backoffTime = Math.pow(2, retries) * 1000;
      console.log(`Retrying in ${backoffTime / 1000} seconds...`);
      await sleep(backoffTime);
      retries++;
    }
  }
}

// Initialize the Prisma client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Main setup function
async function setupDatabase() {
  console.log('Starting database setup...');
  
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
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('Schema pushed successfully!');
      } catch (execError) {
        console.error('Error pushing schema:', execError.message);
        throw execError;
      }
      
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
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase(); 