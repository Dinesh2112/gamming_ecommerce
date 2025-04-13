// Script to check product data in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching products from database...');
  
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`Found ${products.length} products in the database`);
    
    if (products.length > 0) {
      console.log('Sample product data:');
      products.forEach((product, index) => {
        console.log(`----- Product ${index + 1} -----`);
        console.log(`ID: ${product.id}`);
        console.log(`Name: ${product.name}`);
        console.log(`Category: ${product.category.name}`);
        console.log(`Price: ${product.price}`);
        console.log(`Image URL: ${product.imageUrl || 'No image URL'}`);
        console.log(`Stock: ${product.stock}`);
        console.log('\n');
      });
    } else {
      console.log('No products found in the database');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 