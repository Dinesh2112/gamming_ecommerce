// Test client to diagnose API issues
const axios = require('axios');
const prompt = require('prompt-sync')({ sigint: true });

const baseURL = 'http://localhost:5000';

// Function to authenticate and get a token
async function authenticate() {
  try {
    console.log('Attempting to log in...');
    const email = prompt('Enter your email: ');
    const password = prompt('Enter your password: ');
    
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email,
      password
    });
    
    console.log('Authentication successful!');
    console.log('User data:', response.data.user);
    return response.data.token;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to initialize a chat
async function initializeChat(token) {
  try {
    console.log('Attempting to initialize chat...');
    const response = await axios.post(
      `${baseURL}/api/ai/chat/initialize`,
      {},
      {
        headers: {
          'x-auth-token': token
        }
      }
    );
    
    console.log('Chat initialized successfully!');
    console.log('Chat ID:', response.data.chatId);
    console.log('Messages:', response.data.messages);
    return response.data;
  } catch (error) {
    console.error('Chat initialization failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Main function
async function main() {
  try {
    // First authenticate
    const token = await authenticate();
    if (!token) {
      console.log('Exiting due to authentication failure');
      return;
    }
    
    // Then try to initialize a chat
    const chat = await initializeChat(token);
    if (!chat) {
      console.log('Exiting due to chat initialization failure');
      return;
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
main(); 