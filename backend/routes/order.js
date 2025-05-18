const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { PrismaClient } = require("@prisma/client");
const { validateStockAvailability, updateStockOnPurchase } = require("../middleware/stockManagement");

const prisma = new PrismaClient();

// Get all user orders - protected route
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching orders for user ID:", req.user.id);
    
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    console.log(`Found ${orders.length} orders for user ID ${req.user.id}`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Error fetching orders", 
      error: error.message, 
      userId: req.user?.id || 'unknown'
    });
  }
});

// Create new order - apply stock validation before processing order
router.post("/", verifyToken, validateStockAvailability, updateStockOnPurchase, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }
    
    // Create the order with basic info
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentMethod: paymentMethod || "Credit Card",
        paymentStatus: "paid", // Assuming payment is handled elsewhere
        status: "confirmed",
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    // Add shipping address if provided
    if (shippingAddress) {
      await prisma.shippingAddress.create({
        data: {
          orderId: order.id,
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode || shippingAddress.postalCode
        }
      });
    }
    
    // Clear user's cart after successful order
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// Get specific order details
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user.id // Ensure the order belongs to this user
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
});

module.exports = router;
