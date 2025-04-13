// Script to test creating a chat session using the global prisma instance
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();
const prisma = new PrismaClient();

// Make prisma globally available
global.prisma = prisma;

// Configure middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  console.log('Token received:', token ? "Yes" : "No");
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(400).json({ message: 'Token is not valid' });
  }
};

// Chat initialization route
app.post('/api/ai/chat/initialize', verifyToken, async (req, res) => {
  console.log('Initialize chat endpoint called');
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    // Look for an existing chat from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Querying for existing chat');
    let chat = await global.prisma.aIChat.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });
    
    console.log('Existing chat found:', !!chat);
    
    // If no chat exists, create a new one
    if (!chat) {
      console.log('Creating new chat');
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
      console.log('New chat created with ID:', chat.id);
    }
    
    // Format the messages for the client
    const formattedMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
    
    console.log('Returning chat data');
    return res.status(200).json({
      chatId: chat.id,
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error initializing chat:', error);
    return res.status(500).json({
      message: 'Failed to initialize chat',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test token generation endpoint
app.get('/generate-test-token', async (req, res) => {
  try {
    // Find a user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({ message: 'No users found in database' });
    }
    
    // Create JWT payload
    const payload = {
      id: user.id
    };
    
    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error generating test token:', error);
    return res.status(500).json({
      message: 'Failed to generate test token',
      error: error.message
    });
  }
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('You can test the chat initialization at:');
  console.log(`http://localhost:${PORT}/generate-test-token`);
  console.log('Then use the token to make a POST request to:');
  console.log(`http://localhost:${PORT}/api/ai/chat/initialize`);
}); 