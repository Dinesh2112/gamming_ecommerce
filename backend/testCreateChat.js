// Script to test creating an AIChat entry directly with Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testCreateChat() {
  console.log('🔍 Testing AIChat creation...');
  
  try {
    // First find a user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No users found in the database!');
      return;
    }
    
    console.log(`Found user: ID=${user.id}, Name=${user.name}`);
    
    // Create a new chat directly
    console.log(`Creating a test chat for user ${user.id}...`);
    
    const chat = await prisma.aIChat.create({
      data: {
        userId: user.id,
        messages: {
          create: [
            {
              role: 'assistant',
              content: 'This is a test message created by the script',
              timestamp: new Date(),
            }
          ]
        }
      },
      include: {
        messages: true,
      },
    });
    
    console.log('Chat created successfully!');
    console.log('Chat details:', {
      id: chat.id,
      userId: chat.userId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messagesCount: chat.messages.length,
    });
    
    // Print the messages
    console.log('Messages:');
    chat.messages.forEach(msg => {
      console.log(`- Role: ${msg.role}, Content: ${msg.content.substring(0, 50)}...`);
    });
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error creating test chat:', error);
    console.error('Stack trace:', error.stack);
    
    // If this is a Prisma error, show more details
    if (error.code) {
      console.error('Prisma error code:', error.code);
      if (error.meta) {
        console.error('Prisma error meta:', error.meta);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCreateChat(); 