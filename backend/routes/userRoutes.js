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
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

module.exports = router;
