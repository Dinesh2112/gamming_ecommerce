const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  console.log("====== ADMIN USER ROUTES MIDDLEWARE ======");
  console.log("User object:", JSON.stringify(req.user));
  console.log("User role:", req.user?.role);
  
  if (req.user && req.user.role === 'ADMIN') {
    console.log('Admin access granted for user:', req.user.email);
    next();
  } else {
    console.log('Admin access denied for user:', req.user?.email, 'with role:', req.user?.role);
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Apply both middleware to all admin routes
router.use(verifyToken, isAdmin);

// Get all users with their order counts and total spent
router.get('/', async (req, res) => {
  try {
    console.log('Admin fetching all users');
    
    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true,
            paymentMethod: true,
            items: {
              select: {
                quantity: true
              }
            }
          }
        }
      }
    });
    
    // Format the users for frontend
    const formattedUsers = users.map(user => {
      // Format each order with needed fields
      const formattedOrders = user.orders.map(order => ({
        id: order.id,
        date: order.createdAt,
        totalAmount: order.totalAmount || 0,
        status: order.status || 'delivered',
        items: order.items.reduce((total, item) => total + item.quantity, 0),
        paymentMethod: order.paymentMethod || 'Credit Card'
      }));
      
      // Handle address - it might be stored as a JSON string
      let address;
      try {
        address = user.address ? 
          (typeof user.address === 'string' ? 
            JSON.parse(user.address) : user.address) : 
          {
            addressLine1: 'No address provided',
            city: user.city || 'Unknown',
            state: user.state || 'Unknown',
            postalCode: user.postalCode || 'Unknown',
            country: 'India'
          };
      } catch (e) {
        console.error('Error parsing user address:', e);
        address = {
          addressLine1: 'Error parsing address',
          city: 'Unknown',
          state: 'Unknown',
          postalCode: 'Unknown',
          country: 'India'
        };
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 9876543210', // Fallback if phone is not in DB
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || user.updatedAt || user.createdAt,
        address,
        orders: formattedOrders
      };
    });
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user details by id with their complete order history
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive information like password
    const { password, ...userWithoutPassword } = user;
    
    // Format any necessary fields like address if stored as JSON string
    let formattedUser = { ...userWithoutPassword };
    
    if (user.address && typeof user.address === 'string') {
      try {
        formattedUser.address = JSON.parse(user.address);
      } catch (e) {
        console.error('Error parsing user address:', e);
        formattedUser.address = {
          addressLine1: 'Error parsing address',
          city: 'Unknown',
          state: 'Unknown',
          postalCode: 'Unknown',
          country: 'India'
        };
      }
    }
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

module.exports = router; 