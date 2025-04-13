// Script to test the AIChat initialization API endpoint
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const baseURL = 'http://localhost:5000';

// Generate a token for a test user
async function generateTestToken() {
  // Find a user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    throw new Error('No user found in the database');
  }
  
  // Create JWT payload (similar to what your auth endpoint does)
  const payload = {
    id: user.id,
    // Add any other fields you normally include in your token
  };
  
  // Check if JWT_SECRET is available
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }
  
  // Sign token with 1 hour expiration
  const token = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: '1h' }
  );
  
  return { token, user };
}

// Test the API endpoint
async function testApiEndpoint() {
  try {
    console.log('🔍 Testing AI Chat initialize API endpoint...');
    
    // Generate a test token
    const { token, user } = await generateTestToken();
    console.log(`Generated test token for user: ${user.name} (${user.email})`);
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Call the API endpoint
    console.log('\nCalling API endpoint: POST /api/ai/chat/initialize');
    const response = await axios.post(
      `${baseURL}/api/ai/chat/initialize`,
      {}, // Empty body
      {
        headers: {
          'x-auth-token': token
        }
      }
    );
    
    console.log(`\n✅ API call successful (Status: ${response.status}):`);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing API endpoint:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Disconnect Prisma
    await prisma.$disconnect();
  }
}

// Run the test
testApiEndpoint(); 