// Script to set up test data in the database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting to seed the database...');

  // Create categories
  console.log('Creating categories...');
  const categories = [
    { name: 'CPU', description: 'Processors for gaming PCs' },
    { name: 'GPU', description: 'Graphics cards for gaming PCs' },
    { name: 'RAM', description: 'Memory modules for gaming PCs' },
    { name: 'Storage', description: 'Storage drives for gaming PCs' },
    { name: 'Motherboard', description: 'Motherboards for gaming PCs' },
    { name: 'Case', description: 'PC cases for gaming builds' },
    { name: 'Cooling', description: 'Cooling solutions for gaming PCs' },
    { name: 'PSU', description: 'Power supply units for gaming PCs' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }

  // Create test users
  console.log('Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
    {
      name: 'Dinesh',
      email: 'dineshpandian1931@gmail.com',
      password: hashedPassword,
      role: 'user',
    },
    {
      name: 'Test User',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'user',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  // Create test products
  console.log('Creating test products...');
  
  // Get category IDs
  const cpuCategory = await prisma.category.findUnique({ where: { name: 'CPU' } });
  const gpuCategory = await prisma.category.findUnique({ where: { name: 'GPU' } });
  const ramCategory = await prisma.category.findUnique({ where: { name: 'RAM' } });
  
  const products = [
    {
      name: 'AMD Ryzen 7 5800X',
      description: 'High-performance CPU for gaming, 8 cores, 16 threads',
      price: 23999.99,
      imageUrl: 'https://example.com/ryzen-7-5800x.jpg',
      stock: 15,
      categoryId: cpuCategory.id,
      brand: 'AMD',
      model: '5800X',
      clockSpeed: 3.8,
      cores: 8,
      threads: 16,
      socketType: 'AM4',
      powerConsumption: 105,
      performanceScore: 87.5,
      releaseDate: new Date('2020-11-05'),
      updatedAt: new Date(),
    },
    {
      name: 'NVIDIA GeForce RTX 3080',
      description: 'High-end graphics card for 4K gaming',
      price: 69999.99,
      imageUrl: 'https://example.com/rtx-3080.jpg',
      stock: 5,
      categoryId: gpuCategory.id,
      brand: 'NVIDIA',
      model: 'RTX 3080',
      vram: 10,
      rayTracingSupport: true,
      powerConsumption: 320,
      performanceScore: 94.2,
      releaseDate: new Date('2020-09-17'),
      updatedAt: new Date(),
    },
    {
      name: 'G.SKILL Trident Z RGB 32GB',
      description: 'High-performance RGB DDR4 memory kit (2x16GB)',
      price: 9999.99,
      imageUrl: 'https://example.com/gskill-tridentz.jpg',
      stock: 25,
      categoryId: ramCategory.id,
      brand: 'G.SKILL',
      model: 'Trident Z RGB',
      capacity: 32,
      type: 'DDR4',
      speed: 3600,
      rgb: true,
      performanceScore: 82.0,
      releaseDate: new Date('2019-06-10'),
      updatedAt: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { 
        name_brand: {
          name: product.name,
          brand: product.brand
        }
      },
      update: product,
      create: product,
    });
  }

  console.log('✅ Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 