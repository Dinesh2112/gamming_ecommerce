const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Log debug information
  console.log("====== ADMIN ROUTES MIDDLEWARE ======");
  console.log("User object:", JSON.stringify(req.user));
  console.log("User role:", req.user?.role);
  console.log("Role is ADMIN?", req.user?.role === 'ADMIN');
  
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

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    console.log('Getting dashboard stats for admin:', req.user.email);
    
    // Get counts
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const productCount = await prisma.product.count();
    const chatCount = await prisma.aIChat.count();
    
    // Calculate revenue
    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get product category distribution
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    
    const categoryMap = {};
    products.forEach(product => {
      if (product.category) {
        const catName = product.category.name;
        categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      }
    });
    
    const categoryDistribution = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count
    }));
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true
      }
    });
    
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.createdAt
    }));
    
    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5
        }
      },
      include: {
        category: true
      },
      take: 5
    });
    
    const formattedLowStockProducts = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      category: { 
        name: product.category?.name || 'Uncategorized'
      }
    }));
    
    // Construct the response
    const dashboardData = {
      counts: {
        users: userCount,
        orders: orderCount,
        products: productCount,
        revenue: totalRevenue,
        chats: chatCount
      },
      categoryDistribution,
      recentOrders: formattedRecentOrders,
      lowStockProducts: formattedLowStockProducts
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
});

// Normalize all admin roles to uppercase
router.post('/normalize-roles', async (req, res) => {
  try {
    console.log('Normalizing admin roles for all users');
    
    // Find users with 'admin' role (lowercase)
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      }
    });
    
    console.log(`Found ${adminUsers.length} users with lowercase 'admin' role`);
    
    // Update all admin users to have 'ADMIN' role (uppercase)
    if (adminUsers.length > 0) {
      const updatePromises = adminUsers.map(user => 
        prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        })
      );
      
      const updated = await Promise.all(updatePromises);
      console.log(`Updated ${updated.length} users to have uppercase 'ADMIN' role`);
    }
    
    res.json({ 
      message: `Updated ${adminUsers.length} users to have uppercase 'ADMIN' role` 
    });
  } catch (error) {
    console.error('Error normalizing admin roles:', error);
    res.status(500).json({ message: 'Error normalizing admin roles', error: error.message });
  }
});

module.exports = router; 
