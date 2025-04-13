// Simplified AI controller that uses the global Prisma instance
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI with your API key
const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
console.log("Fixed Controller - Gemini API Key Available:", apiKey !== "YOUR_API_KEY_HERE" ? "Yes (key is set)" : "No (using placeholder)");

// Try to initialize genAI
let genAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("Google Generative AI initialized in fixedAiController");
} catch (error) {
  console.error("Failed to initialize Google Generative AI:", error.message);
}

// The model to use - we've verified this one works!
const MODEL_NAME = "gemini-1.5-pro";

// Initialize a chat session or retrieve an existing one
const initializeChat = async (req, res) => {
  try {
    console.log("Starting initializeChat function");
    
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    console.log("User ID:", userId);
    
    // Look for an existing chat from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let chat;
    try {
      console.log("Looking for existing chat for user ID:", userId);
      // Use the global prisma instance
      chat = await global.prisma.aIChat.findFirst({
        where: {
          userId,
          createdAt: { gte: today }
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });
      
      console.log("Found existing chat:", !!chat);
      
      // If no chat exists, create a new one
      if (!chat) {
        console.log("Creating new chat for user ID:", userId);
        // Use the global prisma instance
        chat = await global.prisma.aIChat.create({
          data: {
            userId,
            messages: {
              create: [{
                role: 'assistant',
                content: "Hello! I'm your PC building assistant. How can I help you today?",
                timestamp: new Date()
              }]
            }
          },
          include: {
            messages: true
          }
        });
        console.log("Created new chat with ID:", chat.id);
      }
      
      // Format the messages for the client
      const formattedMessages = chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      return res.status(200).json({
        chatId: chat.id,
        messages: formattedMessages
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: 'Database error',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error("General error:", error);
    return res.status(500).json({
      message: 'Failed to initialize chat',
      error: error.message
    });
  }
};

// Process a message in a chat
const processMessage = async (req, res) => {
  try {
    console.log("\n===== PROCESSING MESSAGE =====");
    const { chatId, content } = req.body;
    const userId = req.user.id;
    
    console.log(`User: ${userId}, Chat: ${chatId}, Message length: ${content?.length || 0}`);
    
    if (!chatId || !content) {
      return res.status(400).json({ message: 'ChatId and content are required' });
    }
    
    // Verify the chat belongs to the user
    const chat = await global.prisma.aIChat.findFirst({
      where: {
        id: chatId,
        userId
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    console.log(`Found chat with ${chat.messages.length} existing messages`);
    
    // Add the user message to the database
    await global.prisma.aIMessage.create({
      data: {
        chatId,
        role: 'user',
        content,
        timestamp: new Date()
      }
    });
    
    console.log("User message saved to database");
    
    // Check if Gemini is initialized
    if (!genAI) {
      console.error("Gemini AI is not initialized");
      
      // Store the error response
      const errorResponse = "I'm sorry, the AI service is not properly initialized. Please contact support.";
      await global.prisma.aIMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: errorResponse,
          timestamp: new Date(),
        }
      });
      
      return res.status(200).json({
        message: errorResponse,
        suggestedProducts: [],
      });
    }
    
    // Get product information to help the AI provide accurate recommendations
    const products = await global.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        brand: true,
      },
    });
    
    console.log(`Retrieved ${products.length} products from database`);
    
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
    
    If you recommend specific products, provide their IDs so I can display them to the user.
    Format product recommendations like this: [PRODUCT_ID:123, PRODUCT_ID:456]
    `;
    
    console.log("Calling Gemini API with the verified model...");
    
    try {
      // Create a Gemini model instance with the system prompt
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      console.log(`Created model instance with model name: ${MODEL_NAME}`);
      
      // For simplicity, let's use the direct generation approach
      const generationConfig = {
        maxOutputTokens: 1000,
        temperature: 0.7,
      };
      
      // Create a structured prompt including context
      const previousMessages = chat.messages
        .filter((msg, idx) => idx > 0 && idx > chat.messages.length - 6) // Get last 5 messages excluding welcome
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n\n");
        
      const promptWithContext = `
System: ${systemPrompt}

Previous conversation:
${previousMessages}

User: ${content}
`;
      
      console.log("Calling Gemini API...");
      
      const result = await model.generateContent(promptWithContext);
      const responseText = result.response.text();
      
      console.log(`Received response from Gemini (${responseText.length} characters)`);
      
      // Extract product IDs if any were recommended
      const productIdMatches = responseText.match(/\[PRODUCT_ID:(\d+)(, PRODUCT_ID:\d+)*\]/g);
      let recommendedProductIds = [];
      
      if (productIdMatches) {
        // Extract all product IDs from the matches
        recommendedProductIds = productIdMatches.flatMap(match => {
          return match.match(/\d+/g).map(Number);
        });
        console.log(`Found ${recommendedProductIds.length} product recommendations:`, recommendedProductIds);
      }
      
      // Clean up the response to remove the product ID markers
      const cleanResponse = responseText.replace(/\[PRODUCT_ID:\d+(, PRODUCT_ID:\d+)*\]/g, '');
      
      // Store the AI's response
      await global.prisma.aIMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: cleanResponse,
          timestamp: new Date(),
        }
      });
      
      console.log("AI response saved to database");
      
      // Get recommended product details if any
      let suggestedProducts = [];
      if (recommendedProductIds.length > 0) {
        suggestedProducts = await global.prisma.product.findMany({
          where: {
            id: {
              in: recommendedProductIds,
            },
          },
        });
        console.log(`Retrieved ${suggestedProducts.length} suggested products`);
      }
      
      console.log("===== MESSAGE PROCESSING COMPLETE =====\n");
      
      return res.status(200).json({
        message: cleanResponse,
        suggestedProducts,
      });
    } catch (aiError) {
      console.error("===== ERROR CALLING GEMINI API =====");
      console.error(`Error type: ${aiError.name}`);
      console.error(`Error message: ${aiError.message}`);
      console.error(`Stack trace: ${aiError.stack}`);
      
      // Check for specific error types
      if (aiError.message.includes("API key")) {
        console.error("Possible cause: Invalid API key format or unauthorized key");
      } else if (aiError.message.includes("network")) {
        console.error("Possible cause: Network connectivity issues");
      } else if (aiError.message.includes("quota")) {
        console.error("Possible cause: API quota exceeded");
      } else if (aiError.message.includes("model")) {
        console.error("Possible cause: Model name issue or model not available");
      }
      
      // Use a fallback response for simplicity during testing
      const simpleResponse = `I'm a simplified PC building assistant. You asked: "${content}". 
Without the full AI capability, I can tell you that gaming PCs typically need a good CPU, 
GPU, sufficient RAM, and storage. For a better experience, please try again later when 
our AI service is fully functional.`;
      
      // Store the fallback response
      await global.prisma.aIMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: simpleResponse,
          timestamp: new Date(),
        }
      });
      
      console.log("Simple fallback response saved to database");
      console.log("===== MESSAGE PROCESSING COMPLETE (WITH ERRORS) =====\n");
      
      return res.status(200).json({
        message: simpleResponse,
        suggestedProducts: [],
      });
    }
  } catch (error) {
    console.error("===== GENERAL ERROR IN PROCESS MESSAGE =====");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    
    return res.status(500).json({
      message: 'Failed to process message',
      error: error.message
    });
  }
};

// Get user's chat history
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await global.prisma.aIChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp
      }))
    }));
    
    return res.status(200).json({ chats: formattedChats });
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return res.status(500).json({
      message: 'Failed to retrieve chat history',
      error: error.message
    });
  }
};

// Export the functions
module.exports = {
  initializeChat,
  processMessage,
  getChatHistory
}; 