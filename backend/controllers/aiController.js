const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create a new instance of PrismaClient with debug logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Initialize the Google Generative AI with your API key
// In production, this would come from environment variables
const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
console.log("Gemini API Key Available:", apiKey !== "YOUR_API_KEY_HERE" ? "Yes (key is set)" : "No (using placeholder)");

let genAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("Google Generative AI initialized successfully");
} catch (error) {
  console.error("Failed to initialize Google Generative AI:", error);
}

// Export the prisma instance for use in routes
module.exports.prisma = prisma;

/**
 * Initialize a chat session or retrieve an existing one
 */
const initializeChat = async (req, res) => {
  console.log("\n======== INITIALIZE CHAT FUNCTION CALLED ========");
  
  try {
    console.log("Initialize Chat - Starting function");
    console.log("Request headers:", req.headers);
    
    // Verify req.user exists
    if (!req.user || !req.user.id) {
      console.error('User authentication issue in initializeChat:', { user: req.user });
      return res.status(401).json({ message: 'User not authenticated properly' });
    }
    
    const userId = req.user.id;
    console.log('Initializing chat for user ID:', userId);

    // Look for an existing chat from the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Searching for chat since:", today.toISOString());

    try {
      console.log("Executing Prisma query to find existing chat...");
      
      // Test database connection first
      try {
        console.log("Testing database connection...");
        const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
        console.log("Database connection test result:", dbTest);
      } catch (dbConnectionError) {
        console.error("Database connection test failed:", dbConnectionError);
        return res.status(500).json({
          message: 'Database connection failed',
          error: dbConnectionError.message,
        });
      }
      
      // Now try to find the chat
      console.log("Executing findFirst query with prisma:", !!prisma);
      let chat = await prisma.aIChat.findFirst({
        where: {
          userId,
          createdAt: {
            gte: today,
          },
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      });

      console.log("Existing chat query result:", chat ? `Found (ID: ${chat.id})` : "Not found");

      // If no chat exists, create a new one
      if (!chat) {
        console.log('Creating a new chat for user ID:', userId);
        try {
          chat = await prisma.aIChat.create({
            data: {
              userId,
              messages: {
                create: [
                  {
                    role: 'assistant',
                    content: "Hello! I'm your PC building assistant. I can help you choose components for your gaming PC based on your budget and requirements. What are you looking for today?",
                    timestamp: new Date(),
                  }
                ]
              }
            },
            include: {
              messages: true,
            },
          });
          console.log("New chat created with ID:", chat.id);
        } catch (createError) {
          console.error("Error creating new chat:", createError);
          console.error("Create chat stack trace:", createError.stack);
          
          // Check for specific Prisma errors
          if (createError.code) {
            console.error("Prisma error code:", createError.code);
            console.error("Prisma error details:", createError.meta);
          }
          
          return res.status(500).json({
            message: 'Failed to create new chat',
            error: createError.message,
            details: createError.code ? createError.meta : undefined,
          });
        }
      }

      // Format the messages for the client
      const formattedMessages = chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      console.log("Sending chat data to client. Chat ID:", chat.id);
      console.log("Number of messages:", formattedMessages.length);
      
      return res.json({
        chatId: chat.id,
        messages: formattedMessages,
      });
    } catch (dbError) {
      console.error("Database error in initializeChat:", dbError);
      console.error("Database error stack trace:", dbError.stack);
      
      // Check for specific Prisma errors
      if (dbError.code) {
        console.error("Prisma error code:", dbError.code);
        console.error("Prisma error details:", dbError.meta);
      }
      
      return res.status(500).json({
        message: 'Database operation failed',
        error: dbError.message,
        details: dbError.code ? dbError.meta : undefined,
      });
    }
  } catch (error) {
    console.error('Error initializing chat:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      message: 'Failed to initialize chat',
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  } finally {
    console.log("======== END INITIALIZE CHAT FUNCTION ========\n");
  }
};

/**
 * Process a message from the user and generate a response with Gemini
 */
const processMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.id;

    if (!content || !chatId) {
      return res.status(400).json({ message: 'Content and chatId are required' });
    }

    // Check if the chat belongs to the user
    const userChat = await prisma.aIChat.findUnique({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!userChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Store the user's message
    await prisma.aIMessage.create({
      data: {
        chatId,
        role: 'user',
        content,
        timestamp: new Date(),
      }
    });

    // Prepare context for Gemini
    const chatHistory = userChat.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add the new user message
    chatHistory.push({
      role: 'user',
      parts: [{ text: content }],
    });

    // Get product information to help the AI provide accurate recommendations
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        brand: true,
        // Add other relevant fields
      },
    });

    // Generate system prompt with product knowledge
    const systemPrompt = `You are a PC building assistant for a gaming hardware e-commerce store. 
    You help customers choose the right components for their gaming PCs based on their budget and requirements.
    
    Here is information about our current inventory:
    ${JSON.stringify(products)}
    
    When recommending products:
    1. Stay within the user's budget if specified
    2. Recommend compatible components
    3. Prioritize value for money
    4. Consider the user's specific gaming or usage requirements
    
    IMPORTANT: When you recommend specific products, you MUST include their IDs. 
    Format product recommendations by embedding the ID in brackets like this: [PRODUCT:123]
    This allows me to display the product information to the user.
    
    Example response with product recommendations:
    "Based on your requirements, I recommend the [PRODUCT:42] which has excellent performance for gaming at 1440p. For the CPU, the [PRODUCT:57] offers great value."
    `;

    // Create a Gemini model instance with the system prompt
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Start a chat session
    const geminiChat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
      systemInstruction: systemPrompt,
    });

    // Send the message and get response
    const result = await geminiChat.sendMessage(content);
    const responseText = result.response.text();

    // Extract product IDs using a more robust regex that matches [PRODUCT:123] format
    const productIdMatches = responseText.match(/\[PRODUCT:(\d+)\]/g);
    let recommendedProductIds = [];
    
    if (productIdMatches) {
      // Extract all product IDs from the matches
      recommendedProductIds = productIdMatches.map(match => {
        const id = match.match(/\d+/)[0];
        return parseInt(id, 10);
      });
      
      console.log("Extracted product IDs:", recommendedProductIds);
    }

    // Clean up the response to remove the product ID markers
    const cleanResponse = responseText.replace(/\[PRODUCT:\d+\]/g, '');

    // Store the AI's response
    await prisma.aIMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date(),
      }
    });

    // Get recommended product details if any
    let suggestedProducts = [];
    if (recommendedProductIds.length > 0) {
      suggestedProducts = await prisma.product.findMany({
        where: {
          id: {
            in: recommendedProductIds,
          },
        },
      });
      
      console.log(`Found ${suggestedProducts.length} products out of ${recommendedProductIds.length} recommendations`);
      
      // Add product references to the message
      await Promise.all(recommendedProductIds.map(async (productId) => {
        try {
          await prisma.productReference.create({
            data: {
              messageId: (await prisma.aIMessage.findFirst({
                where: { 
                  chatId,
                  role: 'assistant' 
                },
                orderBy: { 
                  timestamp: 'desc' 
                }
              })).id,
              productId
            }
          });
        } catch (err) {
          console.error(`Failed to create product reference for product ${productId}:`, err);
        }
      }));
    }

    res.json({
      message: cleanResponse,
      suggestedProducts,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      message: 'Failed to process message',
      error: error.message,
    });
  }
};

// Get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all chats for the user with their messages
    const chats = await prisma.aIChat.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'  // Most recent chats first
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'  // Messages in chronological order
          },
          include: {
            productReferences: true  // Include product references
          }
        }
      }
    });
    
    // Format the response
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        productReferences: msg.productReferences
      }))
    }));
    
    // Return the formatted chats as an object with a 'chats' property
    return res.status(200).json({ chats: formattedChats });
    
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve chat history',
      error: error.message 
    });
  }
};

// Get a specific chat by ID
const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId);
    
    if (isNaN(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    
    // Get the chat with its messages
    const chat = await prisma.aIChat.findUnique({
      where: {
        id: chatId,
        userId
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          },
          include: {
            productReferences: true
          }
        }
      }
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Get all unique product IDs referenced in the chat
    const productIds = new Set();
    chat.messages.forEach(message => {
      if (message.productReferences && message.productReferences.length > 0) {
        message.productReferences.forEach(ref => {
          productIds.add(ref.productId);
        });
      }
    });
    
    // Fetch all referenced products
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: Array.from(productIds)
        }
      }
    });
    
    // Format the messages
    const formattedMessages = chat.messages.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      productReferences: message.productReferences
    }));
    
    // Return chat details, messages, and products
    return res.json({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: formattedMessages,
      products: products,
      suggestedProducts: products // Include for backward compatibility
    });
  } catch (error) {
    console.error('Error retrieving chat by ID:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve chat', 
      error: error.message 
    });
  }
};

// Delete a chat by ID
const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId);
    
    if (isNaN(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    
    // First check if the chat exists and belongs to the user
    const chat = await prisma.aIChat.findUnique({
      where: { id: chatId },
      select: { userId: true }
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    if (chat.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete all product references related to the chat's messages
    await prisma.$transaction(async (prisma) => {
      // Get all message IDs for this chat
      const messages = await prisma.aIMessage.findMany({
        where: { chatId },
        select: { id: true }
      });
      
      const messageIds = messages.map(msg => msg.id);
      
      // Delete product references for these messages
      if (messageIds.length > 0) {
        await prisma.productReference.deleteMany({
          where: {
            messageId: {
              in: messageIds
            }
          }
        });
      }
      
      // Delete all messages for this chat
      await prisma.aIMessage.deleteMany({
        where: { chatId }
      });
      
      // Finally delete the chat itself
      await prisma.aIChat.delete({
        where: { id: chatId }
      });
    });
    
    return res.status(200).json({ message: 'Chat deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ 
      message: 'Failed to delete chat',
      error: error.message 
    });
  }
};

// Create a new chat session
const createNewChat = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create a new chat
    const chat = await prisma.aIChat.create({
      data: {
        userId,
        messages: {
          create: [
            {
              role: 'assistant',
              content: "Hello! I'm your PC building assistant. I can help you choose components for your gaming PC based on your budget and requirements. What are you looking for today?",
              timestamp: new Date(),
            }
          ]
        }
      },
      include: {
        messages: true,
      },
    });
    
    // Format the messages for the client
    const formattedMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
    
    res.json({
      chatId: chat.id,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error('Error creating new chat:', error);
    res.status(500).json({
      message: 'Failed to create new chat',
      error: error.message,
    });
  }
};

module.exports = {
  initializeChat,
  processMessage,
  getChatHistory,
  getChatById,
  deleteChat,
  createNewChat
}; 