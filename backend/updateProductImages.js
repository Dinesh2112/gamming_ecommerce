// Script to update product images in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Collection of reliable image URLs for gaming hardware
const reliableImageUrls = {
  CPU: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592664474567-0a1f9815bad5?q=80&w=1000&auto=format&fit=crop'
  ],
  GPU: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1597872200969-2b65b3c1054f?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588941288446-eed30052b11f?q=80&w=1000&auto=format&fit=crop'
  ],
  RAM: [
    'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580236044104-b290d0515f87?q=80&w=1000&auto=format&fit=crop'
  ],
  Storage: [
    'https://images.unsplash.com/photo-1601737487795-dab272f52420?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=1000&auto=format&fit=crop'
  ],
  Motherboard: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop'
  ],
  Generic: [
    'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563018525-82acd8d5e72d?q=80&w=1000&auto=format&fit=crop'
  ]
};

async function main() {
  console.log('Updating product images with reliable URLs...');
  
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`Found ${products.length} products to update`);
    
    for (const product of products) {
      const categoryName = product.category.name;
      const imageArray = reliableImageUrls[categoryName] || reliableImageUrls.Generic;
      const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
      
      console.log(`Updating product ${product.id}: ${product.name}`);
      console.log(`Old image URL: ${product.imageUrl || 'None'}`);
      console.log(`New image URL: ${randomImage}`);
      
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: randomImage }
      });
      
      console.log(`✅ Updated image for ${product.name}`);
      console.log('-----------------------------------');
    }
    
    console.log('All product images have been updated with reliable URLs!');
  } catch (error) {
    console.error('Error updating product images:', error);
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