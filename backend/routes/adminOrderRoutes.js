const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  console.log("====== ADMIN ORDER ROUTES MIDDLEWARE ======");
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

// Get all orders for admin view
router.get('/', async (req, res) => {
  try {
    console.log('Admin fetching all orders');
    
    // Get all orders with user and product details
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
    
    // Format the orders for the frontend
    const formattedOrders = orders.map(order => {
      // Format the products from order items
      const products = order.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));
      
      // Handle shipping address - it might be stored as a JSON string
      let shippingAddress;
      try {
        shippingAddress = order.shippingAddress ? 
          (typeof order.shippingAddress === 'string' ? 
            JSON.parse(order.shippingAddress) : order.shippingAddress) : 
          {
            addressLine1: 'No address provided',
            city: 'Unknown',
            state: 'Unknown',
            postalCode: 'Unknown',
            country: 'India'
          };
      } catch (e) {
        console.error('Error parsing shipping address:', e);
        shippingAddress = {
          addressLine1: 'Error parsing address',
          city: 'Unknown',
          state: 'Unknown',
          postalCode: 'Unknown',
          country: 'India'
        };
      }
      
      return {
        id: order.id,
        user: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone || '+91 9876543210' // Fallback if phone is not in DB
        },
        products,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'Credit Card',
        paymentStatus: order.paymentStatus || 'paid',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress,
        trackingNumber: order.trackingNumber || null,
        deliveryNotes: order.deliveryNotes || ''
      };
    });
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get order details by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Admin updating order ${id} status to ${status}`);
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate the status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(`Error updating order status: ${error.message}`);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

module.exports = router; 