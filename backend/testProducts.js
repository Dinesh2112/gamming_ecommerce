const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function testProducts() {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', testConnection);
    
    // Count products
    const productCount = await prisma.product.count();
    console.log(`Found ${productCount} products in database`);
    
    if (productCount === 0) {
      console.log('No products found. Creating test products...');
      
      // Create a test category
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'This is a test category'
        }
      });
      
      // Create a test product
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'This is a test product',
          price: 999.99,
          imageUrl: 'https://placehold.co/300x200/333/FFF?text=Test+Product',
          stock: 5,
          categoryId: category.id,
          brand: 'Test Brand',
          additionalSpecs: {
            memory: '8GB',
            processor: 'Test Processor'
          },
          tags: ['Test', 'Product', 'Category']
        }
      });
      
      console.log('Created test product:', product);
    } else {
      // Fetch products
      const products = await prisma.product.findMany({
        include: {
          category: true
        }
      });
      
      console.log('Products found:');
      products.forEach(product => {
        console.log(`- ID: ${product.id}, Name: ${product.name}, Price: ${product.price}, Category: ${product.category?.name || 'None'}`);
      });
    }
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProducts().then(() => {
  console.log('Test completed');
}); 