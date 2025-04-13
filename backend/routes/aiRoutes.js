const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Use the fixed controller with working Gemini API
const { 
  initializeChat, 
  processMessage, 
  getChatHistory
} = require('../controllers/fixedAiController');

// Keep the existing controller import for other functions
const {
  getChatById,
  deleteChat,
  createNewChat
} = require('../controllers/aiController');

// Debug middleware to log request details
const debugMiddleware = (req, res, next) => {
  console.log(`\n======== AI ROUTE REQUEST ========`);
  console.log(`Path: ${req.path}`);
  console.log(`Method: ${req.method}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  console.log(`Query:`, req.query);
  console.log(`Params:`, req.params);
  console.log(`User:`, req.user);
  console.log(`======== END REQUEST INFO ========\n`);
  next();
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(`\n======== AI ROUTE ERROR ========`);
  console.error(`Path: ${req.path}`);
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error(`======== END ERROR INFO ========\n`);
  
  res.status(500).json({
    message: 'Internal server error in AI Route',
    error: err.message,
    path: req.path
  });
};

// Initialize or get an existing chat
router.post('/chat/initialize', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    initializeChat(req, res);
  } catch (err) {
    next(err);
  }
});

// Create a new chat session
router.post('/chat/new', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    createNewChat(req, res);
  } catch (err) {
    next(err);
  }
});

// Process a message in a chat
router.post('/chat/message', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    processMessage(req, res);
  } catch (err) {
    next(err);
  }
});

// Get user's chat history
router.get('/chat/history', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    getChatHistory(req, res);
  } catch (err) {
    next(err);
  }
});

// Get a specific chat by ID
router.get('/chat/:chatId', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    getChatById(req, res);
  } catch (err) {
    next(err);
  }
});

// Delete a chat
router.delete('/chat/:chatId', verifyToken, debugMiddleware, (req, res, next) => {
  try {
    deleteChat(req, res);
  } catch (err) {
    next(err);
  }
});

// Apply error handler middleware
router.use(errorHandler);

module.exports = router; 