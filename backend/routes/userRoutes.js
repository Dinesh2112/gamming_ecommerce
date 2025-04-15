const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/userController');
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// User signup route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated properly" });
    }
    
    console.log('Getting user data for ID:', req.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
        // Don't include password
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Normalize the admin role to uppercase
    if (user.role === 'admin') {
      user.role = 'ADMIN';
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// Debug endpoint to check user role from token
router.get('/check-role', verifyToken, (req, res) => {
  try {
    console.log('==== CHECK ROLE ENDPOINT ====');
    console.log('User from token:', JSON.stringify(req.user));
    console.log('Role from token:', req.user.role);
    console.log('Role is ADMIN?', req.user.role === 'ADMIN');
    
    res.json({
      success: true,
      user: req.user,
      role: req.user.role,
      isAdmin: req.user.role === 'ADMIN'
    });
  } catch (error) {
    console.error('Error in check-role endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Temporary endpoint to create admin user - REMOVE AFTER USE
router.get('/create-temp-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('dinesh123', salt);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'dineshrajan2112@gmail.com' }
    });
    
    if (existingUser) {
      // Update the user to be admin
      await prisma.user.update({
        where: { email: 'dineshrajan2112@gmail.com' },
        data: { role: 'ADMIN' }
      });
      
      return res.status(200).json({
        message: 'Existing user updated to admin',
        email: 'dineshrajan2112@gmail.com',
        password: 'dinesh123'
      });
    }
    
    // Create new admin
    const user = await prisma.user.create({
      data: {
        name: 'Dinesh Rajan',
        email: 'dineshrajan2112@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    res.status(201).json({
      message: 'Admin user created',
      email: 'dineshrajan2112@gmail.com',
      password: 'dinesh123'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
