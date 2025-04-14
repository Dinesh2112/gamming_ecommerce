const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCategory() {
  try {
    // Create a GPU category if it doesn't exist
    const gpuCategory = await prisma.category.upsert({
      where: { name: 'GPU' },
      update: {},
      create: {
        name: 'GPU',
        description: 'Graphics Processing Units for gaming and professional work'
      }
    });
    
    console.log('GPU category created or found:', gpuCategory);
    
    // Also create a CPU category
    const cpuCategory = await prisma.category.upsert({
      where: { name: 'CPU' },
      update: {},
      create: {
        name: 'CPU',
        description: 'Central Processing Units'
      }
    });
    
    console.log('CPU category created or found:', cpuCategory);
    
  } catch (err) {
    console.error('Error creating categories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createCategory(); 