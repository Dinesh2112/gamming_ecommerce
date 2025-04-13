// A simple AI controller that doesn't rely on the Gemini API
// but still provides helpful responses for PC building

// PC building knowledge base
const pcKnowledge = {
  budgets: {
    low: {
      range: "Under ₹50,000",
      cpu: ["Intel Core i3-12100F", "AMD Ryzen 3 4100"],
      gpu: ["GTX 1650", "AMD RX 6500 XT"],
      ram: "8GB DDR4 3200MHz",
      storage: "500GB SSD",
      motherboard: "H610 (Intel) or A520 (AMD)",
      psu: "450W 80+ Bronze",
      case: "Basic ATX Mid Tower",
      cooling: "Stock CPU Cooler",
      games: "eSports titles and older AAA games at 1080p medium settings"
    },
    medium: {
      range: "₹50,000 - ₹100,000",
      cpu: ["Intel Core i5-12400F", "AMD Ryzen 5 5600X"],
      gpu: ["RTX 3060", "AMD RX 6600 XT"],
      ram: "16GB DDR4 3600MHz",
      storage: "1TB NVMe SSD",
      motherboard: "B660 (Intel) or B550 (AMD)",
      psu: "650W 80+ Gold",
      case: "Mid Tower with good airflow",
      cooling: "Tower air cooler",
      games: "Modern AAA games at 1080p high settings or 1440p medium settings"
    },
    high: {
      range: "₹100,000 - ₹150,000",
      cpu: ["Intel Core i7-12700K", "AMD Ryzen 7 5800X3D"],
      gpu: ["RTX 3080", "AMD RX 6800 XT"],
      ram: "32GB DDR4 3600MHz",
      storage: "2TB NVMe SSD",
      motherboard: "Z690 (Intel) or X570 (AMD)",
      psu: "850W 80+ Gold",
      case: "Premium Mid Tower with excellent airflow",
      cooling: "240mm AIO liquid cooler",
      games: "All modern games at 1440p ultra settings or 4K high settings"
    },
    extreme: {
      range: "Above ₹150,000",
      cpu: ["Intel Core i9-12900K", "AMD Ryzen 9 5950X"],
      gpu: ["RTX 4090", "AMD RX 7900 XTX"],
      ram: "64GB DDR5 6000MHz",
      storage: "4TB NVMe Gen4 SSD",
      motherboard: "Z690 Premium (Intel) or X570 Premium (AMD)",
      psu: "1000W+ 80+ Platinum",
      case: "Full Tower Premium Case",
      cooling: "360mm AIO liquid cooler",
      games: "All games at 4K ultra settings with high frame rates"
    }
  },
  components: {
    cpu: {
      description: "The Central Processing Unit is the brain of your PC, handling most calculations.",
      tips: "For gaming, prioritize single-core performance over core count. For productivity, more cores help."
    },
    gpu: {
      description: "The Graphics Processing Unit renders images and is crucial for gaming performance.",
      tips: "This is the most important component for gaming. Allocate the largest portion of your budget here."
    },
    ram: {
      description: "Random Access Memory stores data your computer is actively using.",
      tips: "16GB is the sweet spot for gaming. 32GB is better for content creation."
    },
    storage: {
      description: "Where all your data, games, and programs are stored.",
      tips: "An SSD is essential for your operating system and games. Use HDDs for bulk storage."
    },
    motherboard: {
      description: "Connects all your components together.",
      tips: "Make sure it's compatible with your CPU and has all the features you need."
    },
    psu: {
      description: "The Power Supply Unit provides power to all components.",
      tips: "Never cheap out on the PSU. A quality unit protects your other components."
    }
  }
};

// Helper function to analyze a message and generate appropriate response
function generatePcBuildingResponse(message) {
  const lowercaseMsg = message.toLowerCase();
  
  // Detect budget mentions
  const budgetMatch = lowercaseMsg.match(/(?:under|below|less than) (?:₹|rs|inr)? ?(\d{1,3},?\d{3})/i) || 
                     lowercaseMsg.match(/budget (?:of|is|:)? (?:₹|rs|inr)? ?(\d{1,3},?\d{3})/i) ||
                     lowercaseMsg.match(/(?:₹|rs|inr)? ?(\d{1,3},?\d{3}) budget/i);
  
  // Detect component inquiries
  const cpuMention = lowercaseMsg.includes("cpu") || lowercaseMsg.includes("processor");
  const gpuMention = lowercaseMsg.includes("gpu") || lowercaseMsg.includes("graphics card");
  const ramMention = lowercaseMsg.includes("ram") || lowercaseMsg.includes("memory");
  const storageMention = lowercaseMsg.includes("storage") || lowercaseMsg.includes("ssd") || lowercaseMsg.includes("hdd");
  const motherboardMention = lowercaseMsg.includes("motherboard") || lowercaseMsg.includes("mobo");
  const psuMention = lowercaseMsg.includes("psu") || lowercaseMsg.includes("power supply");
  
  // Detect gaming mentions
  const gamingMention = lowercaseMsg.includes("gaming") || lowercaseMsg.includes("game") || 
                       lowercaseMsg.includes("fps") || lowercaseMsg.includes("play");
  
  // Detect specific game mentions
  const gameNames = ["fortnite", "warzone", "cyberpunk", "csgo", "valorant", "minecraft", 
                     "call of duty", "cod", "gta", "apex legends", "pubg"];
  const gameMatches = gameNames.filter(game => lowercaseMsg.includes(game));
  
  // Generate appropriate response based on analysis
  let response = "";
  
  // Budget-based recommendation
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1].replace(",", ""));
    
    if (budget < 50000) {
      response += `For a budget of ₹${budget.toLocaleString()}, here's what I recommend:\n\n`;
      response += `CPU: ${pcKnowledge.budgets.low.cpu.join(" or ")}\n`;
      response += `GPU: ${pcKnowledge.budgets.low.gpu.join(" or ")}\n`;
      response += `RAM: ${pcKnowledge.budgets.low.ram}\n`;
      response += `Storage: ${pcKnowledge.budgets.low.storage}\n`;
      response += `Motherboard: ${pcKnowledge.budgets.low.motherboard}\n`;
      response += `Power Supply: ${pcKnowledge.budgets.low.psu}\n\n`;
      response += `This build is suitable for: ${pcKnowledge.budgets.low.games}\n`;
    } else if (budget < 100000) {
      response += `For a budget of ₹${budget.toLocaleString()}, here's what I recommend:\n\n`;
      response += `CPU: ${pcKnowledge.budgets.medium.cpu.join(" or ")}\n`;
      response += `GPU: ${pcKnowledge.budgets.medium.gpu.join(" or ")}\n`;
      response += `RAM: ${pcKnowledge.budgets.medium.ram}\n`;
      response += `Storage: ${pcKnowledge.budgets.medium.storage}\n`;
      response += `Motherboard: ${pcKnowledge.budgets.medium.motherboard}\n`;
      response += `Power Supply: ${pcKnowledge.budgets.medium.psu}\n\n`;
      response += `This build is suitable for: ${pcKnowledge.budgets.medium.games}\n`;
    } else if (budget < 150000) {
      response += `For a budget of ₹${budget.toLocaleString()}, here's what I recommend:\n\n`;
      response += `CPU: ${pcKnowledge.budgets.high.cpu.join(" or ")}\n`;
      response += `GPU: ${pcKnowledge.budgets.high.gpu.join(" or ")}\n`;
      response += `RAM: ${pcKnowledge.budgets.high.ram}\n`;
      response += `Storage: ${pcKnowledge.budgets.high.storage}\n`;
      response += `Motherboard: ${pcKnowledge.budgets.high.motherboard}\n`;
      response += `Power Supply: ${pcKnowledge.budgets.high.psu}\n\n`;
      response += `This build is suitable for: ${pcKnowledge.budgets.high.games}\n`;
    } else {
      response += `For a premium budget of ₹${budget.toLocaleString()}, here's what I recommend:\n\n`;
      response += `CPU: ${pcKnowledge.budgets.extreme.cpu.join(" or ")}\n`;
      response += `GPU: ${pcKnowledge.budgets.extreme.gpu.join(" or ")}\n`;
      response += `RAM: ${pcKnowledge.budgets.extreme.ram}\n`;
      response += `Storage: ${pcKnowledge.budgets.extreme.storage}\n`;
      response += `Motherboard: ${pcKnowledge.budgets.extreme.motherboard}\n`;
      response += `Power Supply: ${pcKnowledge.budgets.extreme.psu}\n\n`;
      response += `This build is suitable for: ${pcKnowledge.budgets.extreme.games}\n`;
    }
  }
  // Component-specific advice
  else if (cpuMention || gpuMention || ramMention || storageMention || motherboardMention || psuMention) {
    response += "Here's some information about the components you mentioned:\n\n";
    
    if (cpuMention) {
      response += `CPU: ${pcKnowledge.components.cpu.description}\n`;
      response += `Tip: ${pcKnowledge.components.cpu.tips}\n\n`;
      
      if (gamingMention) {
        response += "For gaming, consider these CPUs:\n";
        response += "- Budget: Intel Core i3-12100F or AMD Ryzen 3 4100\n";
        response += "- Mid-range: Intel Core i5-12400F or AMD Ryzen 5 5600X\n";
        response += "- High-end: Intel Core i7-12700K or AMD Ryzen 7 5800X3D\n\n";
      }
    }
    
    if (gpuMention) {
      response += `GPU: ${pcKnowledge.components.gpu.description}\n`;
      response += `Tip: ${pcKnowledge.components.gpu.tips}\n\n`;
      
      if (gamingMention) {
        response += "For gaming, consider these GPUs:\n";
        response += "- Budget: NVIDIA GTX 1650 or AMD RX 6500 XT\n";
        response += "- Mid-range: NVIDIA RTX 3060 or AMD RX 6600 XT\n";
        response += "- High-end: NVIDIA RTX 3080 or AMD RX 6800 XT\n\n";
      }
    }
    
    if (ramMention) {
      response += `RAM: ${pcKnowledge.components.ram.description}\n`;
      response += `Tip: ${pcKnowledge.components.ram.tips}\n\n`;
    }
    
    if (storageMention) {
      response += `Storage: ${pcKnowledge.components.storage.description}\n`;
      response += `Tip: ${pcKnowledge.components.storage.tips}\n\n`;
    }
    
    if (motherboardMention) {
      response += `Motherboard: ${pcKnowledge.components.motherboard.description}\n`;
      response += `Tip: ${pcKnowledge.components.motherboard.tips}\n\n`;
    }
    
    if (psuMention) {
      response += `Power Supply: ${pcKnowledge.components.psu.description}\n`;
      response += `Tip: ${pcKnowledge.components.psu.tips}\n\n`;
    }
  }
  // Specific game recommendations
  else if (gameMatches.length > 0) {
    response += `You mentioned playing ${gameMatches.join(", ")}. Here are my recommendations:\n\n`;
    
    if (gameMatches.includes("cyberpunk") || gameMatches.includes("gta")) {
      response += "For demanding open-world games like Cyberpunk 2077 or GTA V:\n";
      response += "- CPU: Intel Core i5-12400F or better\n";
      response += "- GPU: At least an RTX 3060 or RX 6600 XT\n";
      response += "- RAM: 16GB minimum\n";
      response += "- Storage: SSD strongly recommended\n\n";
    } else if (gameMatches.some(game => ["fortnite", "valorant", "csgo", "apex legends", "pubg"].includes(game))) {
      response += "For competitive shooters like Valorant, CSGO, Fortnite, etc.:\n";
      response += "- CPU: Fast single-core performance is key - Intel Core i3-12100F or better\n";
      response += "- GPU: GTX 1650 or better for 1080p\n";
      response += "- RAM: 16GB recommended\n";
      response += "- Storage: SSD for faster loading times\n\n";
    } else {
      response += "For most modern games at 1080p:\n";
      response += "- CPU: Intel Core i5-12400F or AMD Ryzen 5 5600X\n";
      response += "- GPU: RTX 3060 or RX 6600 XT\n";
      response += "- RAM: 16GB DDR4 3600MHz\n";
      response += "- Storage: 1TB NVMe SSD\n\n";
    }
  }
  // General PC building advice
  else if (lowercaseMsg.includes("build") || lowercaseMsg.includes("pc") || lowercaseMsg.includes("computer")) {
    response += "Here are some general PC building tips:\n\n";
    response += "1. Allocate your budget wisely - prioritize the GPU for gaming\n";
    response += "2. Make sure all components are compatible (use PCPartPicker)\n";
    response += "3. Don't cheap out on the power supply\n";
    response += "4. Consider future upgradability\n";
    response += "5. Case airflow is important for cooling\n";
    response += "6. Install the operating system on an SSD\n\n";
    response += "What's your budget or specific use case? I can give more tailored advice.";
  }
  // Fallback response
  else {
    response += "I'm your PC building assistant. I can help with:\n\n";
    response += "- Recommending components based on your budget\n";
    response += "- Explaining different PC parts and their importance\n";
    response += "- Suggesting builds for specific games or use cases\n";
    response += "- Answering questions about compatibility\n\n";
    response += "Let me know your budget or what you need help with!";
  }
  
  return response;
}

// Initialize a chat session or retrieve an existing one
const initializeChat = async (req, res) => {
  try {
    console.log("Starting simple initializeChat function");
    
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
                content: "Hello! I'm your PC building assistant. I can help you choose components for your gaming PC based on your budget and requirements. What are you looking for today?",
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
    console.log("\n===== PROCESSING MESSAGE (SIMPLE) =====");
    const { chatId, content } = req.body;
    const userId = req.user.id;
    
    console.log(`User: ${userId}, Chat: ${chatId}, Message: "${content}"`);
    
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
    
    // Generate a response using our PC building knowledge
    const response = generatePcBuildingResponse(content);
    console.log("Generated response:", response.substring(0, 100) + "...");
    
    // Store the AI's response
    await global.prisma.aIMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
    });
    
    console.log("Assistant response saved to database");
    console.log("===== MESSAGE PROCESSING COMPLETE =====\n");
    
    return res.status(200).json({
      message: response,
      suggestedProducts: [], // No product suggestions in simple mode
    });
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